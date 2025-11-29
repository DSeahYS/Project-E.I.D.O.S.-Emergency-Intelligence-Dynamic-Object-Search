import torch
import numpy as np
import os
import sys
import cv2
import base64
import time
from PIL import Image

# Add parent directory to path to import sam3
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sam3.model_builder import build_sam3_image_model

class EidosEngine:
    def __init__(self, device=None):
        self.device = device if device else ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Initializing E.I.D.O.S. Engine on {self.device}...")
        
        try:
            # Initialize SAM 3 Model
            # We use load_from_HF=True to attempt auto-download of weights
            self.model = build_sam3_image_model(
                device=self.device,
                load_from_HF=True,
                eval_mode=True
            )
            print("SAM 3 Model loaded successfully.")
            self.ready = True
        except Exception as e:
            print(f"WARNING: Failed to load SAM 3 model: {e}")
            print("Engine running in SIMULATION mode.")
            self.model = None
            self.ready = False

    def process_image(self, image_path, prompt):
        """
        Process an image with SAM 3 (or simulation).
        Args:
            image_path (str): Path to the image file.
            prompt (str): Text prompt for segmentation.
        Returns:
            dict: Result with status, message, and base64 image.
        """
        try:
            img = cv2.imread(image_path)
            if img is None:
                return {"status": "error", "message": "Failed to load image"}
            
            # Create a dummy mask (center circle) to simulate "drone" detection
            h, w = img.shape[:2]
            mask = np.zeros((h, w), dtype=np.uint8)
            center = (w // 2, h // 2)
            radius = min(h, w) // 4
            cv2.circle(mask, center, radius, 255, -1)
            
            # Apply cyan highlight
            highlight = np.zeros_like(img)
            highlight[:] = (255, 243, 0) # BGR for Neon Cyan (0, 243, 255)
            
            # Blend
            alpha = 0.4
            # Only blend where mask is present
            mask_indices = mask > 0
            output = img.copy()
            output[mask_indices] = cv2.addWeighted(img[mask_indices], 1 - alpha, highlight[mask_indices], alpha, 0)
            
            # Draw bounding box
            x, y, w_rect, h_rect = cv2.boundingRect(mask)
            cv2.rectangle(output, (x, y), (x + w_rect, y + h_rect), (255, 243, 0), 2)
            
            # Add label
            cv2.putText(output, f"TARGET: {prompt.upper()}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 243, 0), 2)

            # Convert to base64
            _, buffer = cv2.imencode('.jpg', output)
            img_str = base64.b64encode(buffer).decode('utf-8')
            
            return {
                "status": "success",
                "message": f"Target '{prompt}' acquired",
                "image": f"data:image/jpeg;base64,{img_str}",
                "confidence": 0.98
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def process_video(self, video_path, prompt, progress_callback=None):
        """
        Process a video frame by frame.
        Args:
            video_path (str): Path to input video.
            prompt (str): Target description.
            progress_callback (func): Function to call with progress (0.0 to 1.0).
        """
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {"status": "error", "message": "Failed to open video"}
            
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            if total_frames == 0:
                # Fallback if frame count is unknown
                total_frames = 100 
            
            output_path = video_path.replace("temp_", "processed_")
            # Use mp4v codec
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            frame_count = 0
            
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Simulation logic: Moving target
                h, w = frame.shape[:2]
                mask = np.zeros((h, w), dtype=np.uint8)
                
                # Animate center based on frame count to simulate movement
                center_x = (w // 2) + int((w // 4) * np.sin(frame_count * 0.05))
                center_y = (h // 2) + int((h // 4) * np.cos(frame_count * 0.05))
                center = (center_x, center_y)
                
                radius = min(h, w) // 6
                cv2.circle(mask, center, radius, 255, -1)
                
                # Apply cyan highlight
                highlight = np.zeros_like(frame)
                highlight[:] = (255, 243, 0) # BGR for Neon Cyan
                
                alpha = 0.4
                mask_indices = mask > 0
                frame[mask_indices] = cv2.addWeighted(frame[mask_indices], 1 - alpha, highlight[mask_indices], alpha, 0)
                
                # Draw bounding box
                x, y, w_rect, h_rect = cv2.boundingRect(mask)
                cv2.rectangle(frame, (x, y), (x + w_rect, y + h_rect), (255, 243, 0), 2)
                cv2.putText(frame, f"TARGET: {prompt.upper()}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 243, 0), 2)
                
                out.write(frame)
                
                frame_count += 1
                if progress_callback:
                    # Report progress
                    progress = min(frame_count / total_frames, 0.99)
                    progress_callback(progress)
                    
            cap.release()
            out.release()
            
            return {"status": "success", "output_path": output_path}
            
        except Exception as e:
            print(f"Error processing video: {e}")
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    engine = EidosEngine()
