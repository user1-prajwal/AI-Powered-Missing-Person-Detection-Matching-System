import mysql.connector
import json
import numpy as np
from deepface import DeepFace
import os
from dotenv import load_dotenv
load_dotenv()
db_pass=os.getenv("DB_PASSWORD")

# ── Database connection ───────────────────────────────────────
def get_connection():
    return mysql.connector.connect(
        host     = "localhost",
        user     = "root",
        password = db_pass,  # change this
        database = "missing_finder"
    )

# ── Extract face encoding from image ─────────────────────────
def get_encoding(image_path):
    try:
        embedding = DeepFace.represent(
            img_path        = image_path,
            model_name      = "VGG-Face",
            enforce_detection = False
        )
        # Returns a list of dicts, take first face
        return embedding[0]["embedding"]
    except Exception as e:
        print(f"Could not extract face: {e}")
        return None

# ── Save public sighting ──────────────────────────────────────
def save_sighting(image_path, latitude, longitude):
    print("Extracting face encoding...")
    encoding = get_encoding(image_path)

    if encoding is None:
        print("No face found. Sighting not saved.")
        return None

    encoding_json = json.dumps(encoding)

    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO public_sightings (image_path, encoding, latitude, longitude) VALUES (%s, %s, %s, %s)",
        (image_path, encoding_json, latitude, longitude)
    )
    conn.commit()
    sighting_id = cursor.lastrowid
    conn.close()

    print(f"✅ Sighting saved! ID: {sighting_id}")
    return sighting_id

# ── Save missing person ───────────────────────────────────────
def save_missing_person(name, age, image_path, family_email):
    print("Extracting face encoding...")
    encoding = get_encoding(image_path)

    if encoding is None:
        print("No face found. Person not saved.")
        return None

    encoding_json = json.dumps(encoding)

    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO missing_persons (name, age, image_path, encoding, family_email) VALUES (%s, %s, %s, %s, %s)",
        (name, age, image_path, encoding_json, family_email)
    )
    conn.commit()
    person_id = cursor.lastrowid
    conn.close()

    print(f"✅ Missing person saved! ID: {person_id}")
    return person_id

# ── Get all sightings from DB ─────────────────────────────────
def get_all_sightings():
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM public_sightings")
    rows = cursor.fetchall()
    conn.close()
    return rows

# ── Get all missing persons from DB ──────────────────────────
def get_all_missing_persons():
    conn   = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM missing_persons")
    rows = cursor.fetchall()
    conn.close()
    return rows


def save_missing_person(name, age, image_path, family_email, added_by=None):
    encoding = get_encoding(image_path)
    if encoding is None:
        return None

    encoding_json = json.dumps(encoding)
    conn   = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO missing_persons (name, age, image_path, encoding, family_email, added_by) VALUES (%s,%s,%s,%s,%s,%s)",
        (name, age, image_path, encoding_json, family_email, added_by)
    )
    conn.commit()
    person_id = cursor.lastrowid
    conn.close()
    return person_id