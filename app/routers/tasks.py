from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Class, User, StudentTask
from app.schemas import TaskUpdate, CodeExecutionRequest
from .auth import get_current_user

from app.gemini.analyzer import analyze_code

router = APIRouter()

@router.post("/task/{class_id}/assign")
def assign_task(class_id: int, updated_info: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_teacher:
        raise HTTPException(status_code=403, detail="Bu işlemi yalnızca öğretmenler gerçekleştirebilir.")

    class_to_update = db.query(Class).filter(Class.id == class_id).first()
    if not class_to_update:
        raise HTTPException(status_code=404, detail="Sınıf bulunamadı")

    class_to_update.task_description = updated_info.task_description
    class_to_update.task_language = updated_info.task_language

    db.commit()
    db.refresh(class_to_update)

    return {"message": "Görevlendirme bilgileri başarıyla güncellendi"}

@router.post("/task/{class_id}/analyze")
def analyze_task(class_id: int, request: CodeExecutionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.is_teacher:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu işlemi yalnızca öğrenciler gerçekleştirebilir.")

    class_info = db.query(Class).filter(Class.id == class_id).first()
    if not class_info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sınıf bulunamadı.")

    student_task = db.query(StudentTask).filter(StudentTask.user_id == current_user.id, StudentTask.class_id == class_id).first()
    if not student_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Öğrenci görevi bulunamadı.")

    task_description = class_info.task_description
    task_language = class_info.task_language

    result = analyze_code(task_description, task_language, request.code)

    student_task.code = request.code
    student_task.code_summary = result["summary"]
    student_task.completion_percentage = result["percentage"]
    db.commit()

    return {"message": "Görev verisi güncellendi", "completion_percentage": result["percentage"], "code_summary": result["summary"]}

@router.get("/task/{class_id}/{student_id}")
def get_student_code_and_summary(class_id: int, student_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_teacher:
        raise HTTPException(status_code=403, detail="Bu işlemi yalnızca öğretmenler gerçekleştirebilir.")

    class_exists = db.query(Class).filter(Class.id == class_id).first()
    if not class_exists:
        raise HTTPException(status_code=404, detail="Sınıf bulunamadı")

    student_task = db.query(StudentTask).filter(StudentTask.user_id == student_id, StudentTask.class_id == class_id).first()
    if not student_task:
        raise HTTPException(status_code=404, detail="Öğrenci için görev bulunamadı")

    return {"code": student_task.code, "code_summary": student_task.code_summary, "completion_percentage": student_task.completion_percentage}