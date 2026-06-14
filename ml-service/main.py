from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from prioritizer import prioritize_tasks

app = FastAPI(title="Smart Task Prioritizer ML Service")

class TaskInput(BaseModel):
    id: int
    title: str
    deadline: Optional[datetime] = None
    priority: int = 1

class PrioritizeRequest(BaseModel):
    tasks: List[TaskInput]

class PrioritizeResponse(BaseModel):
    id: int
    score: float

@app.post("/ml/prioritize", response_model=List[PrioritizeResponse])
def prioritize(request: PrioritizeRequest):
    try:
        ranked_tasks = prioritize_tasks(request.tasks)
        return ranked_tasks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
