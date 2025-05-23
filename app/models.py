from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from .database import Base

class League(Base):
    __tablename__ = "leagues"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Match(Base):
    __tablename__ = "matches"

    id = Column(String, primary_key=True, index=True)
    league_id = Column(String, ForeignKey("leagues.id"), index=True)
    player1 = Column(String, index=True)
    player2 = Column(String, index=True)
    player1_score = Column(Integer)
    player2_score = Column(Integer)
    winner = Column(String, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 