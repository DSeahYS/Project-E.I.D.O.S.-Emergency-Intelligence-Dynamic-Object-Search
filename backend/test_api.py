import requests
import os

# Configuration
URL = "http://localhost:8000/analyze"
IMAGE_PATH = "backend/test_image.jpg" # We will create a dummy image if needed
PROMPT = "drone"

def create_dummy_image():
    from PIL import Image
    import numpy as np
    # Create a simple RGB image
    img = Image.fromarray(np.zeros((100, 100, 3), dtype=np.uint8))
    img.save(IMAGE_PATH)
    print(f"Created dummy image at {IMAGE_PATH}")

def test_api():
    if not os.path.exists(IMAGE_PATH):
        create_dummy_image()

    print(f"Sending request to {URL}...")
    try:
        with open(IMAGE_PATH, "rb") as f:
            files = {"file": ("test_image.jpg", f, "image/jpeg")}
            data = {"prompt": PROMPT}
            response = requests.post(URL, files=files, data=data)
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("Success!")
            print(f"Message: {result.get('message')}")
            print(f"Image Data Length: {len(result.get('image', ''))}")
        else:
            print("Failed!")
            print(response.text)
            
    except Exception as e:
        print(f"Error: {e}")
        print("Is the backend server running on port 8000?")

if __name__ == "__main__":
    test_api()
