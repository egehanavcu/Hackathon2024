import random
import string
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Class, User, StudentTask
from app.schemas import ClassBase, JoinClassRequest
from app.routers.auth import get_current_user

router = APIRouter()

def generate_invite_code(length=6):
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choices(characters, k=length))

@router.post("/class/create")
def create_class(class_data: ClassBase, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user.is_teacher:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece öğretmenler sınıf oluşturabilir")
    
    invite_code = generate_invite_code()

    new_class = Class(
        teacher_id=current_user.id,
        class_name=class_data.class_name,
        university_name=class_data.university_name,
        invite_code=invite_code
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return {"message": "Sınıf başarıyla oluşturuldu", "class_id": new_class.id, "invite_code": invite_code}

@router.post("/class/join")
def join_class(request: JoinClassRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.is_teacher:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Öğretmenler öğrenci olarak derse katılamaz")

    class_to_join = db.query(Class).filter(Class.invite_code == request.invite_code).first()
    if not class_to_join:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Girilen davet kodu ile eşleşen sınıf bulunamadı")

    existing_user = db.query(User).filter(User.id == current_user.id).first()
    
    if existing_user in class_to_join.students:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Zaten bu sınıftasınız")

    class_to_join.students.append(existing_user)
    db.commit()

    new_task = StudentTask(
        user_id=current_user.id,
        class_id=class_to_join.id,
        code="",
        code_summary="",
        completion_percentage=0
    )

    db.add(new_task)
    db.commit()
    
    return {"message": "Sınıfa başarıyla katıldın ve görev oluşturuldu"}


@router.get("/class/all/teacher")
def get_classes_as_teacher(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_teacher:
        raise HTTPException(status_code=403, detail="Bu işlemi yapma yetkiniz yok")

    classes = db.query(Class).filter(Class.teacher_id == current_user.id).all()
    
    result = []
    for cls in classes:
        student_count = len(cls.students)
        result.append({
            "class_id": cls.id,
            "class_name": cls.class_name,
            "university_name": cls.university_name,
            "invite_code": cls.invite_code,
            "student_count": student_count
        })
    
    return result

@router.get("/class/all/student")
def get_classes_as_student(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    if current_user.is_teacher:
        raise HTTPException(status_code=403, detail="Bu işlemi yapma yetkiniz yok")

    classes = current_user.classes
    result = []
    for cls in classes:
        student_count = len(cls.students)
        teacher_name = f"{cls.teacher.first_name} {cls.teacher.last_name}"

        result.append({
            "class_id": cls.id,
            "class_name": cls.class_name,
            "university_name": cls.university_name,
            "teacher_name": teacher_name,
            "student_count": student_count
        })
    
    return result

@router.get("/class/{class_id}/teacher")
def get_class_details_as_teacher(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.is_teacher:
        raise HTTPException(status_code=403, detail="Bu işlemi yalnızca öğretmenler gerçekleştirebilir")

    class_details = db.query(Class).filter(Class.id == class_id).first()
    
    if not class_details:
        raise HTTPException(status_code=404, detail="Sınıf bulunamadı")

    students_with_progress = []
    for student in class_details.students:
        student_task = db.query(StudentTask).filter(StudentTask.user_id == student.id, StudentTask.class_id == class_id).first()
        
        progress_percentage = student_task.completion_percentage if student_task else 0

        students_with_progress.append({
            "id": student.id,
            "student_name": f"{student.first_name} {student.last_name}",
            "summary": student_task.code_summary,
            "progress_percentage": progress_percentage,
        })

    return {
        "class_name": class_details.class_name,
        "university_name": class_details.university_name,
        "invite_code": class_details.invite_code,
        "task_description": class_details.task_description,
        "task_language": class_details.task_language,
        "students": students_with_progress
    }

@router.get("/class/{class_id}/student")
def get_class_student_info(class_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.is_teacher:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bu bilgiye yalnızca öğrenciler erişebilir.")

    class_info = db.query(Class).filter(Class.id == class_id).first()
    if not class_info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sınıf bulunamadı.")

    student_task = db.query(StudentTask).filter(StudentTask.user_id == current_user.id, StudentTask.class_id == class_id).first()
    
    if not student_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Öğrenciye ait görev bulunamadı.")

    teacher_info = db.query(User).filter(User.id == class_info.teacher_id).first()
    if not teacher_info:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Öğretmen bulunamadı.")

    return {
        "class_info": {
            "class_id": class_info.id,
            "class_name": class_info.class_name,
            "university_name": class_info.university_name,
            "teacher_name": f"{teacher_info.first_name} {teacher_info.last_name}",
            "task_description": class_info.task_description,
            "task_language": class_info.task_language,
        },
        "student_task": {
            "code": student_task.code,
            "progress_percentage": student_task.completion_percentage
        }
    }

@router.post("/class/{class_id}/edit")
def update_class(class_id: int, class_data: ClassBase, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not current_user.is_teacher:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sadece öğretmenler değiştirebilir")

    class_to_update = db.query(Class).filter(Class.id == class_id).first()
    if not class_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sınıf bulunamadı")
    
    class_to_update.class_name = class_data.class_name
    class_to_update.university_name = class_data.university_name
    db.commit()
    db.refresh(class_to_update)
    return {"message": "Sınıf bilgileri başarıyla düzenlendi", "class_id": class_to_update.id}