# import face_recognition
# import cv2
# import numpy as np

# def load_image_rgb(path):
#     # Load with OpenCV, convert to RGB (face_recognition needs RGB, not BGR/RGBA)
#     img = cv2.imread(path)
#     if img is None:
#         print(f"ERROR: Could not load image from {path}")
#         print("Check if the file exists and path is correct")
#         return None
#     img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
#     return img_rgb

# def check_match(known_image_path, unknown_image_path):
#     known_image   = load_image_rgb(known_image_path)
#     unknown_image = load_image_rgb(unknown_image_path)

#     if known_image is None or unknown_image is None:
#         return

#     known_encodings   = face_recognition.face_encodings(known_image)
#     unknown_encodings = face_recognition.face_encodings(unknown_image)

#     if len(known_encodings) == 0:
#         print("No face found in the MISSING PERSON image.")
#         return

#     if len(unknown_encodings) == 0:
#         print("No face found in the PUBLIC image.")
#         return

#     known_encoding   = known_encodings[0]
#     unknown_encoding = unknown_encodings[0]

#     results  = face_recognition.compare_faces([known_encoding], unknown_encoding)
#     distance = face_recognition.face_distance([known_encoding], unknown_encoding)

#     if results[0]:
#         print(f"✅ MATCH FOUND! Confidence: {round((1 - distance[0]) * 100, 2)}%")
#     else:
#         print(f"❌ No match. Similarity: {round((1 - distance[0]) * 100, 2)}%")

# check_match("images/known_person.jpg", "images/known_person.jpg")






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