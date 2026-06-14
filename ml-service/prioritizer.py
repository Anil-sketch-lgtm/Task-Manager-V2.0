import pandas as pd
from datetime import datetime, timezone
import numpy as np

def prioritize_tasks(tasks):
    if not tasks:
        return []
    
    now = datetime.now(timezone.utc)
    
    scored_tasks = []
    for task in tasks:
        # Base score starts with priority (1=Low, 2=Medium, 3=High)
        # Higher score means higher urgency
        score = float(task.priority) * 10
        
        if task.deadline:
            # Ensure deadline is aware for math
            if task.deadline.tzinfo is None:
                deadline = task.deadline.replace(tzinfo=timezone.utc)
            else:
                deadline = task.deadline
                
            time_left = (deadline - now).total_seconds()
            
            # If past due, massive score boost
            if time_left < 0:
                score += 1000 + abs(time_left) / 3600 # +1 point per hour overdue
            else:
                # Add urgency based on how close the deadline is
                days_left = time_left / (3600 * 24)
                if days_left < 1:
                    score += 100 # Due within 24h
                elif days_left < 3:
                    score += 50
                elif days_left < 7:
                    score += 20
        
        scored_tasks.append({
            "id": task.id,
            "score": score
        })
        
    # Sort by score descending
    scored_tasks.sort(key=lambda x: x["score"], reverse=True)
    return scored_tasks

# Note: We would normally load an sklearn model here, extract features, and use model.predict().
# For Phase 3, a heuristic model based on priority and deadline is a solid foundation.
# To integrate sklearn, we could train a model on past UserBehavior to adjust scores
# (e.g., if user always delays "Low" priority tasks, we might downrank them further).
