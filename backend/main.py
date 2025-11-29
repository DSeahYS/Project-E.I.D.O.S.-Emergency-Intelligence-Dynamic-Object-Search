from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import shutil
import uuid
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
jobs = {} # Store job status: {job_id: {"status": "processing", "progress": 0, "result": None}}

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
async def analyze_image(
    file: UploadFile = File(...),
    prompt: str = Form(...)
):
    if not engine:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    
    # Save temp file
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Process with SAM 3
        result = engine.process_image(temp_path, prompt)
        return result
    finally:
        # Cleanup
        if os.path.exists(temp_path):
            os.remove(temp_path)

def process_video_task(job_id: str, file_path: str, prompt: str):
    def update_progress(p):
        jobs[job_id]["progress"] = int(p * 100)
    
    try:
        result = engine.process_video(file_path, prompt, update_progress)
        if result["status"] == "success":
            jobs[job_id]["status"] = "completed"
            jobs[job_id]["result"] = result["output_path"]
            jobs[job_id]["progress"] = 100
        else:
            jobs[job_id]["status"] = "failed"
            jobs[job_id]["error"] = result["message"]
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)

@app.post("/analyze_video")
async def analyze_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    prompt: str = Form(...)
):
    if not engine:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    
    job_id = str(uuid.uuid4())
    temp_path = f"temp_{job_id}_{file.filename}"
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    jobs[job_id] = {"status": "processing", "progress": 0}
    background_tasks.add_task(process_video_task, job_id, temp_path, prompt)
    
    return {"job_id": job_id, "status": "started"}

@app.get("/status/{job_id}")
async def get_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    return jobs[job_id]

@app.get("/result/{job_id}")
async def get_result(job_id: str):
    if job_id not in jobs or jobs[job_id]["status"] != "completed":
        raise HTTPException(status_code=400, detail="Result not ready")
    return FileResponse(jobs[job_id]["result"], media_type="video/mp4")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
