import json
import numpy as np
from database import get_all_sightings, get_all_missing_persons, get_connection

MATCH_THRESHOLD = 0.4  # lower = stricter. 0.4 is good for VGG-Face

def cosine_distance(enc1, enc2):
    a = np.array(enc1)
    b = np.array(enc2)
    return 1 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def find_matches_for_person(missing_person):
    print(f"\nSearching matches for: {missing_person['name']}")
    person_encoding = json.loads(missing_person["encoding"])
    sightings       = get_all_sightings()
    matches         = []

    for sighting in sightings:
        sighting_encoding = json.loads(sighting["encoding"])
        distance          = cosine_distance(person_encoding, sighting_encoding)
        confidence        = round((1 - distance) * 100, 2)

        if distance < MATCH_THRESHOLD:
            print(f"  ✅ Match found! Sighting ID {sighting['id']} — confidence {confidence}%")
            matches.append({
                "sighting_id" : sighting["id"],
                "confidence"  : confidence,
                "latitude"    : sighting["latitude"],
                "longitude"   : sighting["longitude"],
                "image_path"  : sighting["image_path"],
                "image_path"   : sighting["image_path"] 
            })

    if not matches:
        print("  No matches found.")

    return matches

def run_full_scan():
    """Check all missing persons against all sightings."""
    print("Running full scan...")
    missing_persons = get_all_missing_persons()

    for person in missing_persons:
        find_matches_for_person(person)