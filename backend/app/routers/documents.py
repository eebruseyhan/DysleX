import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Document, User
from app.schemas import DocumentListItem, DocumentOut, DocumentUpdate
from app.security import get_current_user
from app.services.text_extractor import ExtractionError, extract_text

router = APIRouter(prefix="/api/documents", tags=["Documents"])

CHUNK_SIZE = 1024 * 1024  # 1 MB


def _get_owned_document(db: Session, doc_id: int, user: User) -> Document:
    doc = db.get(Document, doc_id)
    if not doc or doc.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doküman bulunamadı")
    return doc


@router.post("", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    title: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    original_name = file.filename or "dosya"
    ext = Path(original_name).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Desteklenen türler: {', '.join(sorted(settings.ALLOWED_EXTENSIONS))}",
        )

    # Kullanıcıya özel klasör + benzersiz dosya adı
    user_dir = settings.UPLOAD_DIR / str(current_user.id)
    user_dir.mkdir(parents=True, exist_ok=True)
    stored_path = user_dir / f"{uuid.uuid4().hex}{ext}"

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    written = 0
    try:
        with stored_path.open("wb") as out:
            while chunk := await file.read(CHUNK_SIZE):
                written += len(chunk)
                if written > max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Dosya boyutu {settings.MAX_UPLOAD_SIZE_MB} MB sınırını aşıyor",
                    )
                out.write(chunk)
        if written == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dosya boş")

        text = extract_text(stored_path)
    except ExtractionError as e:
        stored_path.unlink(missing_ok=True)
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except HTTPException:
        stored_path.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    doc = Document(
        user_id=current_user.id,
        title=(title or Path(original_name).stem)[:255],
        file_path=str(stored_path.relative_to(settings.UPLOAD_DIR.parent)),
        extracted_text=text,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("", response_model=list[DocumentListItem])
def list_documents(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
        .all()
    )


@router.get("/{doc_id}", response_model=DocumentOut)
def get_document(
    doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return _get_owned_document(db, doc_id, current_user)


@router.get("/{doc_id}/file")
def download_original(
    doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    doc = _get_owned_document(db, doc_id, current_user)
    path = settings.UPLOAD_DIR.parent / doc.file_path
    if not path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orijinal dosya bulunamadı")
    return FileResponse(path, filename=f"{doc.title}{path.suffix}")


@router.patch("/{doc_id}", response_model=DocumentOut)
def rename_document(
    doc_id: int,
    data: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = _get_owned_document(db, doc_id, current_user)
    doc.title = data.title
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doc_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    doc_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    doc = _get_owned_document(db, doc_id, current_user)
    (settings.UPLOAD_DIR.parent / doc.file_path).unlink(missing_ok=True)
    db.delete(doc)
    db.commit()
