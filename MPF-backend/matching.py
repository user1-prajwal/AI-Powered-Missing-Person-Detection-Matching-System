
from deepface import DeepFace
import os

def check_match(known_path, unknown_path):
    print("\nChecking images...")

    # Check files exist
    if not os.path.exists(known_path):
        print(f"ERROR: File not found - {known_path}")
        return

    if not os.path.exists(unknown_path):
        print(f"ERROR: File not found - {unknown_path}")
        return

    try:
        result = DeepFace.verify(
            img1_path = known_path,
            img2_path = unknown_path,
            model_name = "VGG-Face",   # good accuracy, works offline
            enforce_detection = True   # set False if face not detected error
        )

        distance   = result["distance"]
        threshold  = result["threshold"]
        is_match   = result["verified"]
        confidence = round((1 - distance) * 100, 2)

        if is_match:
            print(f"✅ MATCH FOUND!")
            print(f"   Confidence : {confidence}%")
            print(f"   Distance   : {round(distance, 4)} (threshold: {threshold})")
        else:
            print(f"❌ No match.")
            print(f"   Similarity : {confidence}%")
            print(f"   Distance   : {round(distance, 4)} (threshold: {threshold})")

    except ValueError as e:
        print(f"Face not detected in one of the images.")
        print(f"Try a clearer photo with a visible face.")
        print(f"Details: {e}")

    except Exception as e:
        print(f"Error: {e}")

# Test with your images
check_match("images/nim.jpg", "images/ima.jpg")