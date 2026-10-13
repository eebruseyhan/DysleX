from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserPreference
from app.schemas import PreferenceOut, PreferenceUpdate
from app.security import get_current_user

router = APIRouter(prefix="/api/preferences", tags=["Preferences"])


def _get_or_create(db: Session, user: User) -> UserPreference:
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if pref is None:
        pref = UserPreference(user_id=user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref


@router.get("", response_model=PreferenceOut)
def get_preferences(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return _get_or_create(db, current_user)


@router.put("", response_model=PreferenceOut)
def update_preferences(
    data: PreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    pref = _get_or_create(db, current_user)
    for field, value in data.model_dump(exclude_unset=True, exclude_none=True).items():
        setattr(pref, field, value)
    db.commit()
    db.refresh(pref)
    return pref


@router.post("/reset", response_model=PreferenceOut)
def reset_preferences(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    db.query(UserPreference).filter(UserPreference.user_id == current_user.id).delete()
    db.commit()
    return _get_or_create(db, current_user)
