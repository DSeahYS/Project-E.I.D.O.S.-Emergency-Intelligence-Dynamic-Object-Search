import sys
import os

# Add the parent directory to sys.path to allow importing sam3
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    print("Attempting to import SAM 3...")
    from sam3.model_builder import build_sam3_image_model
    print("SUCCESS: SAM 3 module imported successfully.")
    print("The 'Neural Bridge' is ready to be built.")
except ImportError as e:
    print(f"FAILURE: Could not import SAM 3. Error: {e}")
except Exception as e:
    print(f"FAILURE: An unexpected error occurred. Error: {e}")
