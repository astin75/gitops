from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from datetime import datetime
from pathlib import Path

app = FastAPI(title="Visitor Counter API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 저장 경로
DATA_FILE = Path("data/visitors.json")
DATA_FILE.parent.mkdir(exist_ok=True)

class VisitorResponse(BaseModel):
    count: int
    last_visit: str

def load_visitors():
    """방문자 데이터 로드"""
    if DATA_FILE.exists():
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    return {"count": 0, "visits": []}

def save_visitors(data):
    """방문자 데이터 저장"""
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.get("/healthcheck")
async def healthcheck():
    """헬스체크 엔드포인트"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/visit")
async def get_visitors():
    """현재 방문자 수 조회"""
    data = load_visitors()
    return VisitorResponse(
        count=data["count"],
        last_visit=data["visits"][-1] if data["visits"] else "No visits yet"
    )

@app.post("/visit")
async def increment_visitors():
    """방문자 수 증가"""
    data = load_visitors()
    data["count"] += 1
    data["visits"].append(datetime.now().isoformat())
    
    # 최근 100개 방문 기록만 유지
    if len(data["visits"]) > 100:
        data["visits"] = data["visits"][-100:]
    
    save_visitors(data)
    
    return VisitorResponse(
        count=data["count"],
        last_visit=data["visits"][-1]
    )

@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {
        "message": "Visitor Counter API",
        "endpoints": {
            "GET /healthcheck": "Check API health",
            "GET /visit": "Get current visitor count",
            "POST /visit": "Increment visitor count"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)