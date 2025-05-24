from sqlalchemy.orm import Session
from sqlalchemy import func, desc
import uuid
from typing import List, Optional, Dict
from . import models, schemas

# League operations
def get_leagues(db: Session) -> List[models.League]:
    return db.query(models.League).order_by(models.League.created_at.desc()).all()

def create_league(db: Session, league: schemas.LeagueCreate) -> models.League:
    db_league = models.League(
        id=str(uuid.uuid4()),
        name=league.name,
        description=league.description
    )
    db.add(db_league)
    db.commit()
    db.refresh(db_league)
    return db_league

def get_league(db: Session, league_id: str) -> Optional[models.League]:
    return db.query(models.League).filter(models.League.id == league_id).first()

def update_league(
    db: Session,
    league_id: str,
    league_update: schemas.LeagueUpdate
) -> Optional[models.League]:
    db_league = get_league(db, league_id)
    if db_league:
        for key, value in league_update.dict(exclude_unset=True).items():
            setattr(db_league, key, value)
        db.commit()
        db.refresh(db_league)
    return db_league

def delete_league(db: Session, league_id: str) -> bool:
    """Delete a league and all its related data"""
    # First check if league exists
    db_league = get_league(db, league_id)
    if not db_league:
        return False
    
    try:
        # Delete all matches in the league
        db.query(models.Match).filter(models.Match.league_id == league_id).delete()
        
        # Delete all players in the league
        db.query(models.Player).filter(models.Player.league_id == league_id).delete()
        
        # Delete the league itself
        db.query(models.League).filter(models.League.id == league_id).delete()
        
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False

# Match operations
def create_match(
    db: Session,
    league_id: str,
    match: schemas.MatchCreate
) -> models.Match:
    winner = match.player1 if match.player1_score > match.player2_score else match.player2
    db_match = models.Match(
        id=str(uuid.uuid4()),
        league_id=league_id,
        player1=match.player1,
        player2=match.player2,
        player1_score=match.player1_score,
        player2_score=match.player2_score,
        winner=winner
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

def get_match(db: Session, match_id: str) -> Optional[models.Match]:
    return db.query(models.Match).filter(models.Match.id == match_id).first()

def get_matches(
    db: Session,
    league_id: str,
    limit: int = 50,
    offset: int = 0
) -> List[models.Match]:
    return db.query(models.Match)\
        .filter(models.Match.league_id == league_id)\
        .order_by(desc(models.Match.created_at))\
        .offset(offset)\
        .limit(limit)\
        .all()

def update_match(
    db: Session,
    match_id: str,
    match_update: schemas.MatchUpdate
) -> Optional[models.Match]:
    db_match = get_match(db, match_id)
    if db_match:
        update_data = match_update.dict(exclude_unset=True)
        update_data["winner"] = match_update.player1 if match_update.player1_score > match_update.player2_score else match_update.player2
        for key, value in update_data.items():
            setattr(db_match, key, value)
        db.commit()
        db.refresh(db_match)
    return db_match

def delete_match(db: Session, match_id: str) -> bool:
    db_match = get_match(db, match_id)
    if db_match:
        db.delete(db_match)
        db.commit()
        return True
    return False

# Ranking and statistics operations
def get_rankings(db: Session, league_id: str) -> List[schemas.PlayerStats]:
    # First, get all players from matches
    matches = db.query(models.Match)\
        .filter(models.Match.league_id == league_id)\
        .order_by(models.Match.created_at.asc())\
        .all()
    
    player_stats: Dict[str, schemas.PlayerStats] = {}
    player_streaks: Dict[str, List[bool]] = {}  # Store win/loss sequence for each player
    
    # Initialize stats for all players from matches
    for match in matches:
        # Process player1
        if match.player1 not in player_stats:
            player_stats[match.player1] = schemas.PlayerStats(player_name=match.player1)
            player_streaks[match.player1] = []
        stats1 = player_stats[match.player1]
        stats1.matches_played += 1
        stats1.total_score += match.player1_score
        stats1.highest_score = max(stats1.highest_score, match.player1_score)
        
        # Record win/loss for streaks
        won = match.winner == match.player1
        player_streaks[match.player1].append(won)
        if won:
            stats1.matches_won += 1
        else:
            stats1.matches_lost += 1
        
        # Process player2
        if match.player2 not in player_stats:
            player_stats[match.player2] = schemas.PlayerStats(player_name=match.player2)
            player_streaks[match.player2] = []
        stats2 = player_stats[match.player2]
        stats2.matches_played += 1
        stats2.total_score += match.player2_score
        stats2.highest_score = max(stats2.highest_score, match.player2_score)
        
        # Record win/loss for streaks
        won = match.winner == match.player2
        player_streaks[match.player2].append(won)
        if won:
            stats2.matches_won += 1
        else:
            stats2.matches_lost += 1
    
    # Get all players from the players table
    players = db.query(models.Player)\
        .filter(models.Player.league_id == league_id)\
        .all()
    
    # Add players without matches
    for player in players:
        if player.name not in player_stats:
            player_stats[player.name] = schemas.PlayerStats(
                player_name=player.name,
                matches_played=0,
                matches_won=0,
                matches_lost=0,
                total_score=0,
                highest_score=0,
                average_score=0,
                win_rate=0,
                current_streak=0,
                win_streak=0
            )
    
    # Calculate statistics for each player
    for player_name, stats in player_stats.items():
        if stats.matches_played > 0:
            # Calculate win rate and average score
            stats.win_rate = round(stats.matches_won / stats.matches_played * 100, 2)
            stats.average_score = round(stats.total_score / stats.matches_played, 2)
            
            # Calculate streaks
            streak_list = player_streaks[player_name]
            if streak_list:
                # Calculate current streak
                current_streak = 1
                for i in range(len(streak_list)-1, 0, -1):
                    if streak_list[i] == streak_list[i-1]:
                        current_streak += 1
                    else:
                        break
                stats.current_streak = current_streak if streak_list[-1] else -current_streak
                
                # Calculate longest win streak
                max_streak = 0
                current = 0
                for won in streak_list:
                    if won:
                        current += 1
                        max_streak = max(max_streak, current)
                    else:
                        current = 0
                stats.win_streak = max_streak
    
    # Sort by win rate and return as list
    return sorted(
        player_stats.values(),
        key=lambda x: (-x.win_rate, -x.matches_won, -x.average_score, -x.highest_score, x.player_name)
    )

def get_player_stats(
    db: Session,
    league_id: str,
    player_name: str
) -> Optional[schemas.PlayerStats]:
    matches = db.query(models.Match)\
        .filter(models.Match.league_id == league_id)\
        .filter((models.Match.player1 == player_name) | (models.Match.player2 == player_name))\
        .all()
    
    if not matches:
        return None
    
    stats = schemas.PlayerStats(player_name=player_name)
    
    for match in matches:
        stats.matches_played += 1
        if match.player1 == player_name:
            stats.total_score += match.player1_score
            if match.winner == player_name:
                stats.matches_won += 1
            else:
                stats.matches_lost += 1
        else:
            stats.total_score += match.player2_score
            if match.winner == player_name:
                stats.matches_won += 1
            else:
                stats.matches_lost += 1
    
    stats.win_rate = stats.matches_won / stats.matches_played if stats.matches_played > 0 else 0.0
    return stats

def get_head_to_head(
    db: Session,
    league_id: str,
    player1: str,
    player2: str
) -> Dict:
    matches = db.query(models.Match)\
        .filter(models.Match.league_id == league_id)\
        .filter(
            ((models.Match.player1 == player1) & (models.Match.player2 == player2)) |
            ((models.Match.player1 == player2) & (models.Match.player2 == player1))
        )\
        .all()
    
    total_matches = len(matches)
    player1_wins = 0
    player1_total_score = 0
    player2_total_score = 0
    
    stats = {
        "total_matches": total_matches,
        f"{player1}_wins": 0,
        f"{player2}_wins": 0,
        f"{player1}_win_rate": 0.0,
        f"{player2}_win_rate": 0.0,
        "average_score_difference": 0.0,
        "match_history": []
    }
    
    if total_matches == 0:
        return stats
    
    for match in matches:
        # Count wins and calculate scores
        if match.winner == player1:
            player1_wins += 1
            stats[f"{player1}_wins"] += 1
        else:
            stats[f"{player2}_wins"] += 1
        
        # Calculate total scores for each player
        if match.player1 == player1:
            player1_total_score += match.player1_score
            player2_total_score += match.player2_score
        else:
            player1_total_score += match.player2_score
            player2_total_score += match.player1_score
        
        # Add match details to history
        stats["match_history"].append({
            "id": match.id,
            "date": match.created_at,
            f"{match.player1}_score": match.player1_score,
            f"{match.player2}_score": match.player2_score,
            "winner": match.winner
        })
    
    # Calculate win rates
    stats[f"{player1}_win_rate"] = round(player1_wins / total_matches * 100, 2)
    stats[f"{player2}_win_rate"] = round((total_matches - player1_wins) / total_matches * 100, 2)
    
    # Calculate average score difference
    stats["average_score_difference"] = round((player1_total_score - player2_total_score) / total_matches, 2)
    
    # Add average scores
    stats[f"{player1}_average_score"] = round(player1_total_score / total_matches, 2)
    stats[f"{player2}_average_score"] = round(player2_total_score / total_matches, 2)
    
    return stats

def get_recent_matches(
    db: Session,
    league_id: str,
    limit: int = 10
) -> List[models.Match]:
    return db.query(models.Match)\
        .filter(models.Match.league_id == league_id)\
        .order_by(desc(models.Match.created_at))\
        .limit(limit)\
        .all()

def get_league_stats(db: Session, league_id: str) -> Dict:
    matches = db.query(models.Match)\
        .filter(models.Match.league_id == league_id)\
        .all()
    
    # Get all players from matches
    players_from_matches = set()
    total_score = 0
    highest_score = 0
    
    for match in matches:
        players_from_matches.add(match.player1)
        players_from_matches.add(match.player2)
        match_total = match.player1_score + match.player2_score
        total_score += match_total
        highest_score = max(highest_score, match.player1_score, match.player2_score)
    
    # Get all players from the players table
    players_from_db = db.query(models.Player)\
        .filter(models.Player.league_id == league_id)\
        .all()
    
    # Add players who haven't played any matches
    all_players = players_from_matches.union({player.name for player in players_from_db})
    
    return {
        "total_matches": len(matches),
        "total_players": len(all_players),
        "average_score": total_score / (len(matches) * 2) if matches else 0,
        "highest_score": highest_score
    }

def get_players_by_league(db: Session, league_id: str) -> List[models.Player]:
    return db.query(models.Player).filter(models.Player.league_id == league_id).all()

def create_player(db: Session, league_id: str, name: str) -> models.Player:
    db_player = models.Player(
        id=str(uuid.uuid4()),
        name=name,
        league_id=league_id
    )
    db.add(db_player)
    db.commit()
    db.refresh(db_player)
    return db_player

def delete_player(db: Session, league_id: str, player_name: str) -> bool:
    try:
        # Delete all matches involving this player
        db.query(models.Match)\
            .filter(models.Match.league_id == league_id)\
            .filter((models.Match.player1 == player_name) | (models.Match.player2 == player_name))\
            .delete()
        
        # Delete the player
        result = db.query(models.Player)\
            .filter(models.Player.league_id == league_id)\
            .filter(models.Player.name == player_name)\
            .delete()
        
        db.commit()
        return True
    except Exception:
        db.rollback()
        return False 