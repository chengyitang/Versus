# app/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from . import models, schemas, crud
from .database import SessionLocal, engine, settings

# Create database tables
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Versus competition management platform API",
    version=settings.VERSION
)

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# League related APIs
@app.get("/api/leagues", response_model=List[schemas.LeagueResponse])
async def get_leagues(db: Session = Depends(get_db)):
    """Get all leagues"""
    return crud.get_leagues(db)

@app.post("/api/leagues", response_model=schemas.LeagueResponse)
async def create_league(league: schemas.LeagueCreate, db: Session = Depends(get_db)):
    """Create a new league"""
    return crud.create_league(db=db, league=league)

@app.get("/api/leagues/{league_id}", response_model=schemas.LeagueResponse)
async def get_league(league_id: str, db: Session = Depends(get_db)):
    """Get league info"""
    league = crud.get_league(db, league_id=league_id)
    if league is None:
        raise HTTPException(status_code=404, detail="League not found")
    return league

@app.put("/api/leagues/{league_id}", response_model=schemas.LeagueResponse)
async def update_league(
    league_id: str, 
    league_update: schemas.LeagueUpdate,
    db: Session = Depends(get_db)
):
    """Update league info"""
    league = crud.get_league(db, league_id=league_id)
    if league is None:
        raise HTTPException(status_code=404, detail="League not found")
    
    return crud.update_league(db=db, league_id=league_id, league_update=league_update)

@app.delete("/api/leagues/{league_id}", response_model=schemas.APIResponse)
async def delete_league(league_id: str, db: Session = Depends(get_db)):
    """Delete a league and all its related data"""
    success = crud.delete_league(db, league_id)
    if not success:
        raise HTTPException(
            status_code=404,
            detail="League not found or could not be deleted"
        )
    
    return schemas.APIResponse(
        success=True,
        message="League deleted successfully"
    )

# Match related APIs
@app.post("/api/leagues/{league_id}/matches", response_model=schemas.MatchResponse)
async def create_match(
    league_id: str,
    match: schemas.MatchCreate,
    db: Session = Depends(get_db)
):
    """Create a new match result"""
    league = crud.get_league(db, league_id=league_id)
    if league is None:
        raise HTTPException(status_code=404, detail="League not found")
    
    return crud.create_match(db=db, league_id=league_id, match=match)

@app.get("/api/leagues/{league_id}/matches", response_model=List[schemas.MatchResponse])
async def get_matches(
    league_id: str, 
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get match list"""
    return crud.get_matches(db, league_id=league_id, limit=limit, offset=offset)

@app.put("/api/matches/{match_id}", response_model=schemas.MatchResponse)
async def update_match(
    match_id: str,
    match_update: schemas.MatchUpdate,
    db: Session = Depends(get_db)
):
    """Update match result"""
    match = crud.get_match(db, match_id=match_id)
    if match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    
    return crud.update_match(db=db, match_id=match_id, match_update=match_update)

@app.delete("/api/matches/{match_id}", response_model=schemas.APIResponse)
async def delete_match(
    match_id: str,
    db: Session = Depends(get_db)
):
    """Delete match"""
    match = crud.get_match(db, match_id=match_id)
    if match is None:
        raise HTTPException(status_code=404, detail="Match not found")
    
    success = crud.delete_match(db=db, match_id=match_id)
    return schemas.APIResponse(
        success=success,
        message="Match deleted successfully" if success else "Failed to delete match"
    )

# Player Stats and Rankings APIs
@app.get("/api/leagues/{league_id}/player-stats", response_model=List[schemas.PlayerStats])
async def get_player_stats(league_id: str, db: Session = Depends(get_db)):
    """Get all players' statistics"""
    league = crud.get_league(db, league_id=league_id)
    if league is None:
        raise HTTPException(status_code=404, detail="League not found")
    
    return crud.get_rankings(db, league_id=league_id)  # 重用現有的 crud 函數

@app.get("/api/leagues/{league_id}/rankings", response_model=List[schemas.PlayerStats])
async def get_rankings(league_id: str, db: Session = Depends(get_db)):
    """Get rankings ordered by win rate"""
    league = crud.get_league(db, league_id=league_id)
    if league is None:
        raise HTTPException(status_code=404, detail="League not found")
    
    return crud.get_rankings(db, league_id=league_id)

@app.get("/api/leagues/{league_id}/players/{player_name}", response_model=schemas.PlayerStats)
async def get_player_stats(
    league_id: str, 
    player_name: str, 
    db: Session = Depends(get_db)
):
    """Get player stats"""
    stats = crud.get_player_stats(db, league_id=league_id, player_name=player_name)
    if stats is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return stats

@app.get("/api/leagues/{league_id}/head-to-head/{player1}/{player2}")
async def get_head_to_head(
    league_id: str,
    player1: str,
    player2: str,
    db: Session = Depends(get_db)
):
    """Get head-to-head records"""
    return crud.get_head_to_head(db, league_id=league_id, player1=player1, player2=player2)

# Statistics related APIs
@app.get("/api/leagues/{league_id}/recent")
async def get_recent_matches(
    league_id: str,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    """Get recent matches"""
    return crud.get_recent_matches(db, league_id=league_id, limit=limit)

@app.get("/api/leagues/{league_id}/stats")
async def get_league_stats(league_id: str, db: Session = Depends(get_db)):
    """Get league stats"""
    return crud.get_league_stats(db, league_id=league_id)

@app.post("/api/leagues/{league_id}/players", response_model=schemas.Player)
def create_player(league_id: str, player: schemas.PlayerCreate, db: Session = Depends(get_db)):
    """Create a new player in the league"""
    print("Received request to create player:")
    print(f"League ID: {league_id}")
    print(f"Player data: {player.dict()}")
    
    # Check if league exists
    db_league = crud.get_league(db, league_id)
    if not db_league:
        raise HTTPException(status_code=404, detail="League not found")
    
    # Check if player with same name already exists in the league
    matches = db.query(models.Match)\
        .filter(models.Match.league_id == league_id)\
        .filter((models.Match.player1 == player.name) | (models.Match.player2 == player.name))\
        .first()
    
    if matches:
        raise HTTPException(status_code=400, detail="Player already exists in this league")
    
    return crud.create_player(db, league_id, player.name)

@app.delete("/api/leagues/{league_id}/players/{player_name}", response_model=schemas.APIResponse)
def delete_player(
    league_id: str,
    player_name: str,
    db: Session = Depends(get_db)
):
    """Delete a player from the league"""
    # Check if league exists
    db_league = crud.get_league(db, league_id)
    if not db_league:
        raise HTTPException(status_code=404, detail="League not found")
    
    success = crud.delete_player(db, league_id, player_name)
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete player because they have match records. Delete all matches first."
        )
    
    return schemas.APIResponse(
        success=True,
        message="Player deleted successfully"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)