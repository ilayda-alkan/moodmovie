from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Feedback, User
from app.schemas import (
    FeedbackCreateRequest,
    FeedbackResponse,
    FeedbackStatsResponse,
)

router = APIRouter(prefix="/feedbacks", tags=["Feedbacks"])

ALLOWED_REACTIONS = {"like", "neutral", "dislike"}


def serialize_feedback(feedback: Feedback) -> FeedbackResponse:
    return FeedbackResponse(
        id=feedback.id,
        movie_id=feedback.movie_id,
        title=feedback.title,
        reaction=feedback.reaction,
        emotion_context=feedback.emotion_context,
        analysis_text=feedback.analysis_text,
    )


@router.get("", response_model=list[FeedbackResponse])
def list_feedbacks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.user_id == current_user.id)
        .order_by(Feedback.updated_at.desc(), Feedback.id.desc())
        .all()
    )

    return [serialize_feedback(feedback) for feedback in feedbacks]


@router.post("", response_model=FeedbackResponse)
def upsert_feedback(
    payload: FeedbackCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reaction = payload.reaction.strip().lower()
    if reaction not in ALLOWED_REACTIONS:
        raise HTTPException(status_code=400, detail="Gecersiz feedback reaksiyonu")

    emotion_context = payload.emotion_context.strip().lower() if payload.emotion_context else None

    existing = (
        db.query(Feedback)
        .filter(
            Feedback.user_id == current_user.id,
            Feedback.movie_id == payload.movie_id,
            Feedback.emotion_context == emotion_context,
        )
        .first()
    )

    now = datetime.now(timezone.utc)

    if existing:
        existing.title = payload.title
        existing.reaction = reaction
        existing.analysis_text = payload.analysis_text
        existing.updated_at = now
        db.commit()
        db.refresh(existing)
        return serialize_feedback(existing)

    feedback = Feedback(
        user_id=current_user.id,
        movie_id=payload.movie_id,
        title=payload.title,
        reaction=reaction,
        emotion_context=emotion_context,
        analysis_text=payload.analysis_text,
        created_at=now,
        updated_at=now,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return serialize_feedback(feedback)


@router.get("/stats", response_model=list[FeedbackStatsResponse])
def feedback_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feedbacks = (
        db.query(Feedback)
        .filter(Feedback.user_id == current_user.id)
        .all()
    )

    grouped = {}
    for feedback in feedbacks:
        key = feedback.emotion_context or "genel"
        if key not in grouped:
            grouped[key] = {
                "emotion_context": key,
                "total": 0,
                "like_count": 0,
                "neutral_count": 0,
                "dislike_count": 0,
            }

        grouped[key]["total"] += 1
        if feedback.reaction == "like":
            grouped[key]["like_count"] += 1
        elif feedback.reaction == "neutral":
            grouped[key]["neutral_count"] += 1
        elif feedback.reaction == "dislike":
            grouped[key]["dislike_count"] += 1

    results = []
    for item in grouped.values():
        approval_rate = 0.0
        if item["total"] > 0:
            approval_rate = round((item["like_count"] / item["total"]) * 100, 2)

        results.append(
            FeedbackStatsResponse(
                emotion_context=item["emotion_context"],
                total=item["total"],
                like_count=item["like_count"],
                neutral_count=item["neutral_count"],
                dislike_count=item["dislike_count"],
                approval_rate=approval_rate,
            )
        )

    return sorted(results, key=lambda item: item.total, reverse=True)


@router.delete("/{feedback_id}")
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    feedback = (
        db.query(Feedback)
        .filter(Feedback.id == feedback_id, Feedback.user_id == current_user.id)
        .first()
    )

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback bulunamadi")

    db.delete(feedback)
    db.commit()

    return {"message": "Feedback kaldirildi"}
