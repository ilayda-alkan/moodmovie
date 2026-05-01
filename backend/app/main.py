import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from app.emotion_model import build_emotion_profile
from app.recommender import recommend_movies_for_profile

from sqlalchemy import text
from sqlalchemy import inspect
from app.database import engine
from app.database import Base, engine
from app.routes.auth_routes import router as auth_router
from app.routes.feedback_routes import router as feedback_router
from app.routes.favorites_routes import router as favorites_router

from app.auth import hash_password


app = FastAPI(title="MoodMovie API")

Base.metadata.create_all(bind=engine)  


def ensure_feedback_columns():
    inspector = inspect(engine)
    if "feedbacks" not in inspector.get_table_names():
        return

    feedback_columns = {column["name"] for column in inspector.get_columns("feedbacks")}

    with engine.begin() as connection:
        if "analysis_text" not in feedback_columns:
            connection.execute(text("ALTER TABLE feedbacks ADD COLUMN analysis_text VARCHAR"))


ensure_feedback_columns()

app.include_router(auth_router) 
app.include_router(favorites_router)
app.include_router(feedback_router)

frontend_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://moodmovie-one.vercel.app",
]

extra_origins = os.getenv("CORS_ORIGINS", "")
if extra_origins.strip():
    frontend_origins.extend(
        [origin.strip() for origin in extra_origins.split(",") if origin.strip()]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(frontend_origins)),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str


@app.options("/analyze-mood")
async def options_analyze_mood(request: Request):
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin") or "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": request.headers.get(
                "access-control-request-headers"
            )
            or "Content-Type",
        },
    )

@app.post("/analyze-mood")
async def analyze_mood(req: AnalyzeRequest):
    emotion_profile = build_emotion_profile(req.text)
    movies = recommend_movies_for_profile(emotion_profile)

    return {
        "emotion_label": emotion_profile["emotion_label"],
        "confidence": emotion_profile["confidence"],
        "mood": emotion_profile["primary_emotion"],
        "primary_emotion": emotion_profile["primary_emotion"],
        "intensity": emotion_profile["intensity"],
        "top_emotions": emotion_profile["top_emotions"],
        "movies": movies,
    }

@app.get("/debug-hash")
def debug_hash():
    hashed = hash_password("123456")
    return {"hashed": hashed}
