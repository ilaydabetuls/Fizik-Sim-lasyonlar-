from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database.database import get_db, engine
from database import models
from pydantic import BaseModel
from typing import Dict, List, Optional
from services.analysis import calculate_item_statistics, generate_automated_insights

models.Base.metadata.create_all(bind=engine)
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

class LogItem(BaseModel):
    questionId: str
    openedAt: Optional[int]
    firstAnsweredAt: Optional[int]
    lastAnsweredAt: Optional[int]
    closedAt: Optional[int]
    timeSpentMs: int
    changeCount: int
    selectedAnswer: Optional[str]

class SubmitTestRequest(BaseModel):
    participantCode: str
    answers: Dict[str, str]
    logs: List[LogItem]
    startedAt: str
    finishedAt: str
    totalDuration: float

class LoginRequest(BaseModel):
    code: str

@app.post("/api/login")
def login_participant(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Participant).filter(models.Participant.participantCode == request.code).first()
    if not user: raise HTTPException(status_code=404, detail="Kod bulunamadı.")
    return {"message": "Hoş geldiniz.", "participantCode": user.participantCode, "preTestCompleted": user.preTestCompleted, "postTestCompleted": user.postTestCompleted}

@app.post("/api/student/status")
def check_student_status(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.Participant).filter(models.Participant.participantCode == request.code).first()
    if not user: raise HTTPException(status_code=404, detail="Kod bulunamadı.")
    can_take_pre_test = not user.preTestCompleted
    can_take_post_test = False
    target_date_iso = None

    if user.preTestCompleted and not user.postTestCompleted:
        pre_test = db.query(models.PreTest).filter(models.PreTest.participantCode == user.participantCode).order_by(models.PreTest.id.desc()).first()
        if pre_test and pre_test.finishedAt:
            target_date = pre_test.finishedAt + timedelta(days=7)
            target_date_iso = target_date.isoformat()
            if datetime.now(target_date.tzinfo) >= target_date or user.isManualUnlocked:
                can_take_post_test = True

    return {"participantCode": user.participantCode, "canTakePreTest": can_take_pre_test, "canTakePostTest": can_take_post_test, "postTestUnlockTime": target_date_iso, "postTestCompleted": user.postTestCompleted}

@app.post("/api/pre-test/submit")
def submit_pre_test(request: SubmitTestRequest, db: Session = Depends(get_db)):
    user = db.query(models.Participant).filter(models.Participant.participantCode == request.participantCode).first()
    correct_answers = {"q1": "C", "q2": "B", "q3": "B"}
    total_correct = sum(1 for q, a in request.answers.items() if correct_answers.get(q) == a)
    total_empty = sum(1 for q in correct_answers if q not in request.answers)
    total_wrong = len(correct_answers) - total_correct - total_empty

    new_test = models.PreTest(
        participantCode=request.participantCode, totalCorrect=total_correct, totalWrong=total_wrong, totalEmpty=total_empty,
        startedAt=datetime.fromisoformat(request.startedAt.replace('Z', '+00:00')), finishedAt=datetime.fromisoformat(request.finishedAt.replace('Z', '+00:00')), totalDuration=request.totalDuration
    )
    db.add(new_test)
    db.flush()
    
    for log in request.logs:
        db.add(models.PreTestAnswer(
            testId=new_test.id, questionId=log.questionId, openedAt=datetime.fromtimestamp(log.openedAt/1000) if log.openedAt else None,
            firstAnsweredAt=datetime.fromtimestamp(log.firstAnsweredAt/1000) if log.firstAnsweredAt else None, lastAnsweredAt=datetime.fromtimestamp(log.lastAnsweredAt/1000) if log.lastAnsweredAt else None,
            closedAt=datetime.fromtimestamp(log.closedAt/1000) if log.closedAt else None, timeSpentMs=log.timeSpentMs, changeCount=log.changeCount, selectedAnswer=log.selectedAnswer, isCorrect=(correct_answers.get(log.questionId) == log.selectedAnswer)
        ))
    user.preTestCompleted = True
    db.commit()
    return {"message": "Başarılı"}

@app.post("/api/post-test/submit")
def submit_post_test(request: SubmitTestRequest, db: Session = Depends(get_db)):
    user = db.query(models.Participant).filter(models.Participant.participantCode == request.participantCode).first()
    correct_answers = {"q1": "A", "q2": "D", "q3": "D"}
    total_correct = sum(1 for q, a in request.answers.items() if correct_answers.get(q) == a)
    total_empty = sum(1 for q in correct_answers if q not in request.answers)
    total_wrong = len(correct_answers) - total_correct - total_empty

    new_test = models.PostTest(
        participantCode=request.participantCode, totalCorrect=total_correct, totalWrong=total_wrong, totalEmpty=total_empty,
        startedAt=datetime.fromisoformat(request.startedAt.replace('Z', '+00:00')), finishedAt=datetime.fromisoformat(request.finishedAt.replace('Z', '+00:00')), totalDuration=request.totalDuration
    )
    db.add(new_test)
    db.flush()

    for log in request.logs:
        db.add(models.PostTestAnswer(
            testId=new_test.id, questionId=log.questionId, openedAt=datetime.fromtimestamp(log.openedAt/1000) if log.openedAt else None,
            firstAnsweredAt=datetime.fromtimestamp(log.firstAnsweredAt/1000) if log.firstAnsweredAt else None, lastAnsweredAt=datetime.fromtimestamp(log.lastAnsweredAt/1000) if log.lastAnsweredAt else None,
            closedAt=datetime.fromtimestamp(log.closedAt/1000) if log.closedAt else None, timeSpentMs=log.timeSpentMs, changeCount=log.changeCount, selectedAnswer=log.selectedAnswer, isCorrect=(correct_answers.get(log.questionId) == log.selectedAnswer)
        ))
    user.postTestCompleted = True
    db.commit()
    return {"message": "Başarılı"}

@app.get("/api/admin/hierarchy")
def get_hierarchy(db: Session = Depends(get_db)):
    data = db.query(models.Participant.educationLevel, models.Participant.grade, func.count(models.Participant.participantCode).label("count")).group_by(models.Participant.educationLevel, models.Participant.grade).all()
    result = {}
    for level, grade, count in data:
        if not level: continue
        if level not in result: result[level] = []
        result[level].append({"grade": grade, "count": count})
    for level in result: result[level] = sorted(result[level], key=lambda x: str(x["grade"]))
    return result

@app.get("/api/admin/participants")
def get_participants(level: str, grade: str, search: str = "", page: int = 1, limit: int = 50, db: Session = Depends(get_db)):
    query = db.query(models.Participant).filter(models.Participant.educationLevel == level, models.Participant.grade == grade)
    if search: query = query.filter(models.Participant.participantCode.ilike(f"%{search}%"))
    total = query.count()
    participants = query.order_by(models.Participant.lastActionDate.desc()).offset((page - 1) * limit).limit(limit).all()
    results = []
    for p in participants:
        status = "Son Test Tamamlandı" if p.postTestCompleted else "Ön Test Tamamlandı" if p.preTestCompleted else "Bekliyor"
        results.append({"participantCode": p.participantCode, "department": p.department, "gender": p.gender, "status": status, "lastActionDate": p.lastActionDate})
    return {"total": total, "page": page, "limit": limit, "totalPages": (total + limit - 1) // limit, "data": results}

@app.get("/api/admin/participant/{code}")
def get_participant_detail(code: str, db: Session = Depends(get_db)):
    p = db.query(models.Participant).filter(models.Participant.participantCode == code).first()
    if not p: raise HTTPException(status_code=404, detail="Bulunamadı")
    pre_test = db.query(models.PreTest).filter(models.PreTest.participantCode == code).first()
    post_test = db.query(models.PostTest).filter(models.PostTest.participantCode == code).first()
    return {
        "info": {"participantCode": p.participantCode, "educationLevel": p.educationLevel, "grade": p.grade, "department": p.department, "gender": p.gender},
        "preTest": pre_test, "postTest": post_test,
        "preLogs": db.query(models.PreTestAnswer).filter(models.PreTestAnswer.testId == pre_test.id).all() if pre_test else [],
        "postLogs": db.query(models.PostTestAnswer).filter(models.PostTestAnswer.testId == post_test.id).all() if post_test else []
    }

@app.post("/api/admin/participant/{code}/unlock")
def unlock_post_test(code: str, db: Session = Depends(get_db)):
    user = db.query(models.Participant).filter(models.Participant.participantCode == code).first()
    user.isManualUnlocked = True
    db.add(models.AdminLog(actionType="UNLOCK_TEST", targetParticipant=code))
    db.commit()
    return {"message": "Süre kaldırıldı."}

@app.post("/api/admin/participant/{code}/reset")
def reset_test(code: str, test_type: str, db: Session = Depends(get_db)):
    user = db.query(models.Participant).filter(models.Participant.participantCode == code).first()
    if test_type == "PRE":
        user.preTestCompleted = False
        db.query(models.PreTest).filter(models.PreTest.participantCode == code).delete()
    elif test_type == "POST":
        user.postTestCompleted = False
        db.query(models.PostTest).filter(models.PostTest.participantCode == code).delete()
    db.add(models.AdminLog(actionType=f"RESET_{test_type}_TEST", targetParticipant=code))
    db.commit()
    return {"message": f"{test_type} sıfırlandı."}

@app.get("/api/admin/advanced-analysis")
def get_advanced_analysis(db: Session = Depends(get_db)):
    participants = db.query(models.Participant).filter(models.Participant.postTestCompleted == True).all()
    total_count = len(participants)
    if total_count == 0: return {"message": "Veri yok."}
    raw_logs = []
    item_stats = calculate_item_statistics(raw_logs, total_count)
    return {"totalParticipants": total_count, "itemAnalysis": item_stats, "automatedInsights": generate_automated_insights(item_stats)}
