from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import GuestFeedback, GuestSession
from app.schemas import (
    FeedbackCreateRequest,
    GuestFeedbackResponse,
    GuestSessionResponse,
)

router = APIRouter(tags=["Guests"])

ALLOWED_REACTIONS = {"like", "neutral", "dislike"}


def get_current_guest_session(
    x_guest_token: str | None = Header(default=None, alias="X-Guest-Token"),
    db: Session = Depends(get_db),
):
    if not x_guest_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Misafir oturumu bulunamadi",
        )

    guest_session = (
        db.query(GuestSession)
        .filter(GuestSession.guest_token == x_guest_token.strip())
        .first()
    )

    if not guest_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Gecersiz misafir oturumu",
        )

    guest_session.last_seen_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(guest_session)
    return guest_session


def serialize_guest_feedback(feedback: GuestFeedback) -> GuestFeedbackResponse:
    return GuestFeedbackResponse(
        id=feedback.id,
        movie_id=feedback.movie_id,
        title=feedback.title,
        reaction=feedback.reaction,
        emotion_context=feedback.emotion_context,
        analysis_text=feedback.analysis_text,
    )


@router.post("/guest/session", response_model=GuestSessionResponse)
def create_guest_session(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    guest_session = GuestSession(
        guest_token=uuid4().hex,
        created_at=now,
        last_seen_at=now,
    )
    db.add(guest_session)
    db.commit()
    db.refresh(guest_session)
    return GuestSessionResponse(guest_token=guest_session.guest_token)


@router.get("/guest-feedbacks", response_model=list[GuestFeedbackResponse])
def list_guest_feedbacks(
    db: Session = Depends(get_db),
    guest_session: GuestSession = Depends(get_current_guest_session),
):
    feedbacks = (
        db.query(GuestFeedback)
        .filter(GuestFeedback.guest_session_id == guest_session.id)
        .order_by(GuestFeedback.updated_at.desc(), GuestFeedback.id.desc())
        .all()
    )
    return [serialize_guest_feedback(feedback) for feedback in feedbacks]


@router.post("/guest-feedbacks", response_model=GuestFeedbackResponse)
def upsert_guest_feedback(
    payload: FeedbackCreateRequest,
    db: Session = Depends(get_db),
    guest_session: GuestSession = Depends(get_current_guest_session),
):
    reaction = payload.reaction.strip().lower()
    if reaction not in ALLOWED_REACTIONS:
        raise HTTPException(status_code=400, detail="Gecersiz feedback reaksiyonu")

    emotion_context = (
        payload.emotion_context.strip().lower() if payload.emotion_context else None
    )
    now = datetime.now(timezone.utc)

    existing = (
        db.query(GuestFeedback)
        .filter(
            GuestFeedback.guest_session_id == guest_session.id,
            GuestFeedback.movie_id == payload.movie_id,
            GuestFeedback.emotion_context == emotion_context,
        )
        .first()
    )

    if existing:
        existing.title = payload.title
        existing.reaction = reaction
        existing.analysis_text = payload.analysis_text
        existing.updated_at = now
        db.commit()
        db.refresh(existing)
        return serialize_guest_feedback(existing)

    feedback = GuestFeedback(
        guest_session_id=guest_session.id,
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
    return serialize_guest_feedback(feedback)


@router.delete("/guest-feedbacks/{feedback_id}")
def delete_guest_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    guest_session: GuestSession = Depends(get_current_guest_session),
):
    feedback = (
        db.query(GuestFeedback)
        .filter(
            GuestFeedback.id == feedback_id,
            GuestFeedback.guest_session_id == guest_session.id,
        )
        .first()
    )

    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback bulunamadi")

    db.delete(feedback)
    db.commit()
    return {"message": "Feedback kaldirildi"}
