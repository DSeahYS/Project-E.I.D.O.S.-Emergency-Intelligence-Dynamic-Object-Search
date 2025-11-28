from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import shutil
from engine import EidosEngine

app = FastAPI(title="E.I.D.O.S. Neural Bridge", version="1.0.0")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Engine (Global Singleton)
# We initialize it lazily or on startup to avoid blocking import times during dev
engine = None

@app.on_event("startup")
async def startup_event():
    global engine
    print("Igniting E.I.D.O.S. Engine...")
    engine = EidosEngine()

@app.get("/")
async def root():
    return {
        "system": "E.I.D.O.S. Neural Bridge",
        "status": "ONLINE",
        "model_loaded": engine.ready if engine else False
    }

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not engine:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    
    # Save temp file
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Process with SAM 3
        result = engine.process_image(temp_path)
        return result
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
