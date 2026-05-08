from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import json
import smtplib
from email.mime.text import MIMEText
from database import get_connection, save_sighting, save_missing_person, get_all_missing_persons
from matcher import find_matches_for_person
from email_service import send_match_alert
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from dotenv import load_dotenv
load_dotenv()
emaill=os.getenv("EMAIL")
e_password=os.getenv("EMAIL_PASSWORD")
app = Flask(__name__)

limiter = Limiter(
    app            = app,
    key_func       = get_remote_address,
    default_limits = ["200 per day"]
)

CORS(app)  # allows React to talk to Flask

# ── Config ────────────────────────────────────────────────────
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}

def verify_token(token_header):
    """Returns org_id if valid token, None if invalid"""
    try:
        token = token_header.replace("Bearer ", "")
        parts = token.split("-")
        # format: token-{org_id}-{type}
        if parts[0] != "token":
            return None
        org_id = int(parts[1])
        return org_id
    except:
        return None

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# ── Email sender 
#removed because, i used email_service

#  PUBLIC PORTAL ROUTES

# Max 5 uploads per IP per hour
@app.route("/api/public/upload", methods=["POST"])
@limiter.limit("5 per hour")
def public_upload():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    # ── File size check (max 5MB) ─────────────────────────────
    file.seek(0, 2)                    # seek to end
    file_size = file.tell()            # get size in bytes
    file.seek(0)                       # reset to start
    if file_size > 5 * 1024 * 1024:   # 5MB
        return jsonify({"error": "File too large. Maximum size is 5MB."}), 400

    # ── File type check ───────────────────────────────────────
    allowed = {"image/jpeg", "image/jpg", "image/png"}
    if file.content_type not in allowed:
        return jsonify({"error": "Only JPG and PNG images allowed."}), 400

    latitude  = request.form.get("latitude",  0)
    longitude = request.form.get("longitude", 0)

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only jpg/jpeg/png allowed"}), 400

    filename  = secure_filename(file.filename)
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(save_path)

    sighting_id = save_sighting(save_path, latitude, longitude)

    if sighting_id is None:
        return jsonify({"error": "No face detected. Please upload a clearer photo."}), 400

    missing_persons = get_all_missing_persons()
    alerts_sent     = 0

    for person in missing_persons:
        matches = find_matches_for_person(person)
        for match in matches:
            if match["sighting_id"] == sighting_id:
                send_match_alert(
                    family_email        = person["family_email"],
                    person_name         = person["name"],
                    confidence          = match["confidence"],
                    latitude            = latitude,
                    longitude           = longitude,
                    sighting_image_path = save_path
                )
                alerts_sent += 1

    return jsonify({
        "message"     : "Sighting uploaded successfully",
        "sighting_id" : sighting_id,
        "alerts_sent" : alerts_sent
    }), 200


# Handle rate limit error nicely
@app.errorhandler(429)
def rate_limit_exceeded(e):
    return jsonify({
        "error": "Too many uploads. You can upload maximum 5 photos per hour. Please try again later."
    }), 429


#  ADMIN PORTAL ROUTES


from werkzeug.security import generate_password_hash, check_password_hash
import secrets

# ── Remove old ADMIN_CREDENTIALS and replace with these routes ──

# Organization Register (any NGO/police can apply)
@app.route("/api/auth/register", methods=["POST"])
def register():
    data     = request.get_json()
    name     = data.get("name")
    email    = data.get("email")
    password = data.get("password")
    org_type = data.get("type", "ngo")   # 'police' or 'ngo'

    if not all([name, email, password]):
        return jsonify({"error": "All fields required"}), 400

    hashed = generate_password_hash(password)

    try:
        conn   = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO organizations (name, type, email, password) VALUES (%s, %s, %s, %s)",
            (name, org_type, email, hashed)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Registration successful. Await super admin approval."}), 201
    except Exception as e:
        return jsonify({"error": "Email already registered"}), 400


# Login — works for all org types
@app.route("/api/auth/login", methods=["POST"])
def login():
    data     = request.get_json()
    email    = data.get("email")
    password = data.get("password")

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM organizations WHERE email = %s", (email,))
    org = cursor.fetchone()
    conn.close()

    if not org:
        return jsonify({"error": "Email not found"}), 401

    if not org["is_approved"]:
        return jsonify({"error": "Your account is pending approval from Super Admin"}), 403

    if not check_password_hash(org["password"], password):
        return jsonify({"error": "Wrong password"}), 401

    # Simple token — org_id:type (in production use JWT)
    token = f"token-{org['id']}-{org['type']}"

    return jsonify({
        "message" : "Login successful",
        "token"   : token,
        "org_name": org["name"],
        "org_type": org["type"]
    }), 200


# Super admin — approve an organization
@app.route("/api/superadmin/approve/<int:org_id>", methods=["POST"])
def approve_org(org_id):
    token = request.headers.get("Authorization", "")
    # Only superadmin token allowed
    if not token.endswith("superadmin"):
        return jsonify({"error": "Unauthorized"}), 401

    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE organizations SET is_approved = TRUE WHERE id = %s", (org_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": f"Organization {org_id} approved"}), 200


# Super admin — view all pending organizations
@app.route("/api/superadmin/pending", methods=["GET"])
def pending_orgs():
    token = request.headers.get("Authorization", "")
    if not token.endswith("superadmin"):
        return jsonify({"error": "Unauthorized"}), 401

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, type, email, created_at FROM organizations WHERE is_approved = FALSE")
    orgs = cursor.fetchall()
    conn.close()
    return jsonify({"pending": orgs}), 200



# Get approved organizations
@app.route("/api/superadmin/approved", methods=["GET"])
def approved_orgs():
    token = request.headers.get("Authorization", "")
    if not token.endswith("superadmin"):
        return jsonify({"error": "Unauthorized"}), 401

    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, name, type, email, created_at FROM organizations WHERE is_approved = TRUE AND type != 'superadmin'"
    )
    orgs = cursor.fetchall()
    conn.close()
    return jsonify({"approved": orgs}), 200


# Reject organization
@app.route("/api/superadmin/reject/<int:org_id>", methods=["DELETE"])
def reject_org(org_id):
    token = request.headers.get("Authorization", "")
    if not token.endswith("superadmin"):
        return jsonify({"error": "Unauthorized"}), 401

    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM organizations WHERE id = %s", (org_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Organization rejected"}), 200



@app.route("/api/admin/missing-persons", methods=["GET"])
def get_missing_persons():
    org_id = verify_token(request.headers.get("Authorization", ""))
    if not org_id:
        return jsonify({"error": "Unauthorized"}), 401

    persons = get_all_missing_persons()
    for p in persons:
        p.pop("encoding", None)
    return jsonify({"missing_persons": persons}), 200


@app.route("/api/admin/add-missing", methods=["POST"])
def add_missing():
    org_id = verify_token(request.headers.get("Authorization", ""))
    if not org_id:
        return jsonify({"error": "Unauthorized"}), 401

    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file         = request.files["image"]
    name         = request.form.get("name",         "Unknown")
    age          = request.form.get("age",          0)
    family_email = request.form.get("family_email", "")

    filename  = secure_filename(file.filename)
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(save_path)

    person_id = save_missing_person(name, age, save_path, family_email, org_id)

    if person_id is None:
        return jsonify({"error": "No face detected in image."}), 400

    persons = get_all_missing_persons()
    for person in persons:
        if person["id"] == person_id:
            matches = find_matches_for_person(person)
            for match in matches:
                # send_alert_email(
                send_match_alert(
                    family_email, name,
                    match["confidence"],
                    match["latitude"],
                    match["longitude"],
                    sighting_image_path = match["image_path"] 
                )

    return jsonify({"message": "Missing person added", "person_id": person_id}), 200

@app.route("/api/admin/rescan", methods=["POST"])
def rescan():
    org_id = verify_token(request.headers.get("Authorization", ""))
    if not org_id:
        return jsonify({"error": "Unauthorized"}), 401

    if "image" not in request.files:
        return jsonify({"error": "No image"}), 400

    file      = request.files["image"]
    person_id = request.form.get("person_id")
    filename  = secure_filename(file.filename)
    save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(save_path)

    # Get person from DB
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM missing_persons WHERE id = %s", (person_id,))
    person = cursor.fetchone()
    conn.close()

    if not person:
        return jsonify({"error": "Person not found"}), 404

    # Update encoding with new photo
    from database import get_encoding
    import json
    new_encoding = get_encoding(save_path)
    if new_encoding is None:
        return jsonify({"error": "No face detected in new photo"}), 400

    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE missing_persons SET encoding = %s, image_path = %s WHERE id = %s",
        (json.dumps(new_encoding), save_path, person_id)
    )
    conn.commit()
    conn.close()

    # Run matching with new encoding
    person["encoding"] = json.dumps(new_encoding)
    matches = find_matches_for_person(person)

    alerts_sent     = 0
    best_confidence = 0

    for match in matches:
        send_match_alert(
            family_email        = person["family_email"],
            person_name         = person["name"],
            confidence          = match["confidence"],
            latitude            = match["latitude"],
            longitude           = match["longitude"],
            sighting_image_path = match["image_path"]
        )
        alerts_sent += 1
        if match["confidence"] > best_confidence:
            best_confidence = match["confidence"]

    return jsonify({
        "matches_found"   : alerts_sent,
        "best_confidence" : best_confidence if alerts_sent > 0 else None
    }), 200
    
@app.route("/api/stats", methods=["GET"])
def get_stats():
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT COUNT(*) as total FROM public_sightings")
    total_sightings = cursor.fetchone()["total"]

    cursor.execute("SELECT COUNT(*) as total FROM missing_persons")
    total_missing = cursor.fetchone()["total"]

    cursor.execute(
        "SELECT COUNT(*) as total FROM organizations WHERE is_approved = TRUE AND type != 'superadmin'"
    )
    total_orgs = cursor.fetchone()["total"]

    conn.close()
    return jsonify({
        "total_sightings": total_sightings,
        "total_missing"  : total_missing,
        "total_orgs"     : total_orgs,
    }), 200
    
    
@app.route("/api/admin/delete-person/<int:person_id>", methods=["DELETE"])
def delete_person(person_id):
    org_id = verify_token(request.headers.get("Authorization", ""))
    if not org_id:
        return jsonify({"error": "Unauthorized"}), 401

    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM missing_persons WHERE id = %s", (person_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Person deleted successfully"}), 200

# Health check
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Missing Person Finder API is running ✅"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)