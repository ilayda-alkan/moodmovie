from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import Favorite, User
from app.schemas import FavoriteCreateRequest, FavoriteResponse

router = APIRouter(prefix="/favorites", tags=["Favorites"])


def serialize_favorite(favorite: Favorite) -> FavoriteResponse:
    genres = []
    if favorite.genres:
        genres = [item for item in favorite.genres.split("|") if item]

    return FavoriteResponse(
        id=favorite.id,
        movie_id=favorite.movie_id,
        title=favorite.title,
        genres=genres,
        trailer_url=favorite.trailer_url,
        is_deleted=favorite.is_deleted,
    )


@router.get("", response_model=list[FavoriteResponse])
def list_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id, Favorite.is_deleted.is_(False))
        .order_by(Favorite.id.desc())
        .all()
    )

    return [serialize_favorite(favorite) for favorite in favorites]


@router.post("", response_model=FavoriteResponse)
def add_favorite(
    payload: FavoriteCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.movie_id == payload.movie_id,
        )
        .first()
    )

    if existing:
        existing.title = payload.title
        existing.genres = "|".join(payload.genres)
        existing.trailer_url = payload.trailer_url
        existing.is_deleted = False
        existing.deleted_at = None
        db.commit()
        db.refresh(existing)
        return serialize_favorite(existing)

    favorite = Favorite(
        user_id=current_user.id,
        movie_id=payload.movie_id,
        title=payload.title,
        genres="|".join(payload.genres),
        trailer_url=payload.trailer_url,
        is_deleted=False,
    )
    db.add(favorite)
    db.commit()
    db.refresh(favorite)

    return serialize_favorite(favorite)


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_favorite(
    movie_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorite = (
        db.query(Favorite)
        .filter(
            Favorite.user_id == current_user.id,
            Favorite.movie_id == movie_id,
            Favorite.is_deleted.is_(False),
        )
        .first()
    )

    if not favorite:
        raise HTTPException(status_code=404, detail="Favori bulunamadı")

    favorite.is_deleted = True
    favorite.deleted_at = datetime.now(timezone.utc)
    db.commit()


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorites = (
        db.query(Favorite)
        .filter(Favorite.user_id == current_user.id, Favorite.is_deleted.is_(False))
        .all()
    )

    deleted_at = datetime.now(timezone.utc)
    for favorite in favorites:
        favorite.is_deleted = True
        favorite.deleted_at = deleted_at

    db.commit()
