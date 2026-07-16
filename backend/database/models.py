from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base

class Participant(Base):
    __tablename__ = "participants"
    participantCode = Column(String, primary_key=True, index=True)
    educationLevel = Column(String, index=True) 
    grade = Column(String, index=True)
    department = Column(String)
    gender = Column(String)
    preTestCompleted = Column(Boolean, default=False)
    postTestCompleted = Column(Boolean, default=False)
    isOngoing = Column(Boolean, default=False)
    isManualUnlocked = Column(Boolean, default=False)
    lastActionDate = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    createdAt = Column(DateTime(timezone=True), server_default=func.now())

class PreTest(Base):
    __tablename__ = "pre_tests"
    id = Column(Integer, primary_key=True, index=True)
    participantCode = Column(String, ForeignKey("participants.participantCode"))
    startedAt = Column(DateTime(timezone=True))
    finishedAt = Column(DateTime(timezone=True))
    totalDuration = Column(Float)
    totalCorrect = Column(Integer, default=0)
    totalWrong = Column(Integer, default=0)
    totalEmpty = Column(Integer, default=0)

class PreTestAnswer(Base):
    __tablename__ = "pre_test_answers"
    id = Column(Integer, primary_key=True, index=True)
    testId = Column(Integer, ForeignKey("pre_tests.id"))
    questionId = Column(String)
    openedAt = Column(DateTime(timezone=True))
    firstAnsweredAt = Column(DateTime(timezone=True), nullable=True)
    lastAnsweredAt = Column(DateTime(timezone=True), nullable=True)
    closedAt = Column(DateTime(timezone=True))
    timeSpentMs = Column(Integer)
    changeCount = Column(Integer, default=0)
    selectedAnswer = Column(String, nullable=True)
    isCorrect = Column(Boolean, nullable=True)

class PostTest(Base):
    __tablename__ = "post_tests"
    id = Column(Integer, primary_key=True, index=True)
    participantCode = Column(String, ForeignKey("participants.participantCode"))
    startedAt = Column(DateTime(timezone=True))
    finishedAt = Column(DateTime(timezone=True))
    totalDuration = Column(Float)
    totalCorrect = Column(Integer, default=0)
    totalWrong = Column(Integer, default=0)
    totalEmpty = Column(Integer, default=0)

class PostTestAnswer(Base):
    __tablename__ = "post_test_answers"
    id = Column(Integer, primary_key=True, index=True)
    testId = Column(Integer, ForeignKey("post_tests.id"))
    questionId = Column(String)
    openedAt = Column(DateTime(timezone=True))
    firstAnsweredAt = Column(DateTime(timezone=True), nullable=True)
    lastAnsweredAt = Column(DateTime(timezone=True), nullable=True)
    closedAt = Column(DateTime(timezone=True))
    timeSpentMs = Column(Integer)
    changeCount = Column(Integer, default=0)
    selectedAnswer = Column(String, nullable=True)
    isCorrect = Column(Boolean, nullable=True)

class AdminLog(Base):
    __tablename__ = "admin_logs"
    id = Column(Integer, primary_key=True, index=True)
    adminUsername = Column(String, default="Admin")
    actionType = Column(String)
    targetParticipant = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
