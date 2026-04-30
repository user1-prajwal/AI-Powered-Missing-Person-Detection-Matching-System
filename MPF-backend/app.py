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
from dotenv import load_dotenv
load_dotenv()
emaill=os.getenv("EMAIL")
e_password=os.getenv("EMAIL_PASSWORD")
app = Flask(__name__)
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

# ── Email sender ──────────────────────────────────────────────
def send_alert_email(family_email, person_name, confidence, latitude, longitude):
    try:
        sender   = emaill     # change this
        password = e_password    # change this (use App Password)

        maps_link = f"https://www.google.com/maps?q={latitude},{longitude}"

        body = f"""
🚨 MISSING PERSON ALERT 🚨

Good news! A possible match has been found for {person_name}.

Match Confidence : {confidence}%
Location         : {maps_link}

Please contact your local police station immediately.

- Missing Person Finder System
        """

        msg           = MIMEText(body)
        msg["Subject"] = f"ALERT: Possible match found for {person_name}"
        msg["From"]    = sender
        msg["To"]      = family_email

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(sender, password)
            smtp.send_message(msg)

        print(f"✅ Email sent to {family_email}")
    except Exception as e:
        print(f"Email failed: {e}")



# send_match_alert(
#     family_email = family_email,
#     person_name  = name,
#     confidence   = match["confidence"],
#     latitude     = match["latitude"],
#     longitude    = match["longitude"]
# )


# ══════════════════════════════════════════════════════════════
#  PUBLIC PORTAL ROUTES
# ══════════════════════════════════════════════════════════════

# Public uploads a sighting — NO login required
@app.route("/api/public/upload", methods=["POST"])
def public_upload():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file      = request.files["image"]
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
        return jsonify({"error": "No face detected in image. Please upload a clearer photo."}), 400

    # ── After saving, check against ALL missing persons ───────
    missing_persons = get_all_missing_persons()
    alerts_sent     = 0

    for person in missing_persons:
        matches = find_matches_for_person(person)
        for match in matches:
            if match["sighting_id"] == sighting_id:
                # Send email alert
                # send_alert_email(
                send_match_alert(
                    family_email = person["family_email"],
                    person_name  = person["name"],
                    confidence   = match["confidence"],
                    latitude     = latitude,
                    longitude    = longitude,
                    sighting_image_path = save_path 
                )
                alerts_sent += 1

    return jsonify({
        "message"     : "Sighting uploaded successfully",
        "sighting_id" : sighting_id,
        "alerts_sent" : alerts_sent
    }), 200


# ══════════════════════════════════════════════════════════════
#  ADMIN PORTAL ROUTES
# ══════════════════════════════════════════════════════════════

# Admin login (simple for now)
# ADMIN_CREDENTIALS = {
#     "username": "admin",
#     "password": "police123"
# }

# @app.route("/api/admin/login", methods=["POST"])
# def admin_login():
#     data = request.get_json()
#     if (data.get("username") == ADMIN_CREDENTIALS["username"] and
#         data.get("password") == ADMIN_CREDENTIALS["password"]):
#         return jsonify({"message": "Login successful", "token": "admin-token-123"}), 200
#     return jsonify({"error": "Invalid credentials"}), 401


# # Admin adds a missing person
# @app.route("/api/admin/add-missing", methods=["POST"])
# def add_missing():
#     # Simple token check
#     token = request.headers.get("Authorization")
#     if token != "Bearer admin-token-123":
#         return jsonify({"error": "Unauthorized"}), 401

#     if "image" not in request.files:
#         return jsonify({"error": "No image uploaded"}), 400

#     file         = request.files["image"]
#     name         = request.form.get("name",         "Unknown")
#     age          = request.form.get("age",          0)
#     family_email = request.form.get("family_email", "")

#     filename  = secure_filename(file.filename)
#     save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
#     file.save(save_path)

#     person_id = save_missing_person(name, age, save_path, family_email)

#     if person_id is None:
#         return jsonify({"error": "No face detected in image."}), 400

#     # ── After adding, immediately check all existing sightings ─
#     persons = get_all_missing_persons()
#     for person in persons:
#         if person["id"] == person_id:
#             matches = find_matches_for_person(person)
#             for match in matches:
#                 send_alert_email(
#                     family_email = family_email,
#                     person_name  = name,
#                     confidence   = match["confidence"],
#                     latitude     = match["latitude"],
#                     longitude    = match["longitude"]
#                 )

#     return jsonify({
#         "message"   : "Missing person added successfully",
#         "person_id" : person_id
#     }), 200


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


# # Update add-missing to use org token
# @app.route("/api/admin/add-missing", methods=["POST"])
# def add_missing():
#     token = request.headers.get("Authorization", "Bearer ")
#     token = token.replace("Bearer ", "")

#     # Extract org_id from token
#     try:
#         org_id = int(token.split("-")[1])
#     except:
#         return jsonify({"error": "Unauthorized"}), 401

#     if "image" not in request.files:
#         return jsonify({"error": "No image uploaded"}), 400

#     file         = request.files["image"]
#     name         = request.form.get("name",         "Unknown")
#     age          = request.form.get("age",          0)
#     family_email = request.form.get("family_email", "")

#     filename  = secure_filename(file.filename)
#     save_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
#     file.save(save_path)

#     # Pass org_id to save function
#     person_id = save_missing_person(name, age, save_path, family_email, org_id)

#     if person_id is None:
#         return jsonify({"error": "No face detected in image."}), 400

#     persons = get_all_missing_persons()
#     for person in persons:
#         if person["id"] == person_id:
#             matches = find_matches_for_person(person)
#             for match in matches:
#                 send_alert_email(family_email, name, match["confidence"],
#                                  match["latitude"], match["longitude"])

#     return jsonify({"message": "Missing person added", "person_id": person_id}), 200



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







# # Admin views all missing persons
# @app.route("/api/admin/missing-persons", methods=["GET"])
# def get_missing_persons():
#     token = request.headers.get("Authorization")
#     if token != "Bearer admin-token-123":
#         return jsonify({"error": "Unauthorized"}), 401

#     persons = get_all_missing_persons()
#     # Don't send encoding (too large) to frontend
#     for p in persons:
#         p.pop("encoding", None)

#     return jsonify({"missing_persons": persons}), 200




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

# Health check
@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "Missing Person Finder API is running ✅"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)