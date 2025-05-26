from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# League schemas
class LeagueBase(BaseModel):
    name: str
    description: Optional[str] = None

class LeagueCreate(LeagueBase):
    pass

class LeagueUpdate(LeagueBase):
    pass

class LeagueResponse(LeagueBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, json_encoders={
        datetime: lambda dt: dt.isoformat() if dt else None
    })

# Match schemas
class MatchBase(BaseModel):
    player1: str
    player2: str
    player1_score: int
    player2_score: int

class MatchCreate(MatchBase):
    pass

class MatchUpdate(MatchBase):
    pass

class MatchResponse(MatchBase):
    id: str
    league_id: str
    winner: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, json_encoders={
        datetime: lambda dt: dt.isoformat() if dt else None
    })

# Player statistics schema
class PlayerStats(BaseModel):
    player_name: str
    matches_played: int = 0
    matches_won: int = 0
    matches_lost: int = 0
    total_score: int = 0
    win_rate: float = 0.0
    average_score: float = 0.0
    highest_score: int = 0
    win_streak: int = 0
    current_streak: int = 0

    model_config = ConfigDict(from_attributes=True)

# API Response schema
class APIResponse(BaseModel):
    success: bool
    message: str

class PlayerCreate(BaseModel):
    name: str

class Player(BaseModel):
    id: str
    name: str
    league_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True, json_encoders={
        datetime: lambda dt: dt.isoformat() if dt else None
    }) 