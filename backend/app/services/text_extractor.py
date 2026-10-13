"""
Yüklenen dosyalardan (PDF, DOCX, TXT) düz metin çıkarma servisi.
"""
import re
from pathlib import Path

from docx import Document as DocxDocument
from pypdf import PdfReader


class ExtractionError(Exception):
    pass


def _clean_text(text: str) -> str:
    # Satır sonu tirelemesini birleştir: "oku-\nma" -> "okuma"
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    # Paragraf içindeki tek satır sonlarını boşluğa çevir, paragraf aralarını koru
    text = re.sub(r"(?<!\n)\n(?!\n)", " ", text)
    # Fazla boşlukları temizle
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _extract_pdf(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = [(page.extract_text() or "") for page in reader.pages]
    return "\n\n".join(pages)


def _extract_docx(path: Path) -> str:
    doc = DocxDocument(str(path))
    return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())


def _extract_txt(path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "cp1254", "latin-1"):
        try:
            return path.read_text(encoding=encoding)
        except UnicodeDecodeError:
            continue
    raise ExtractionError("Metin dosyasının karakter kodlaması çözülemedi")


def extract_text(path: Path) -> str:
    ext = path.suffix.lower()
    try:
        if ext == ".pdf":
            raw = _extract_pdf(path)
        elif ext == ".docx":
            raw = _extract_docx(path)
        elif ext == ".txt":
            raw = _extract_txt(path)
        else:
            raise ExtractionError(f"Desteklenmeyen dosya türü: {ext}")
    except ExtractionError:
        raise
    except Exception as e:  # bozuk / şifreli dosyalar vb.
        raise ExtractionError(f"Dosya okunamadı: {e}") from e

    text = _clean_text(raw)
    if not text:
        raise ExtractionError(
            "Dosyadan metin çıkarılamadı (taranmış/görsel tabanlı bir PDF olabilir)"
        )
    return text
