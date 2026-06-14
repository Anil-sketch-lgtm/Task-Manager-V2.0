# Machine Learning Model Documentation

## Current Phase (Heuristic Priority Scoring)
Currently, the system uses a mathematical heuristic algorithm to score and sort tasks.
- **Base Score**: `Task Priority (1-3) * 10`
- **Urgency Multiplier**: Exponential penalty based on time until deadline relative to the current UTC time.
    - Due < 24 hours: `+100 points`
    - Due < 3 days: `+50 points`
    - Past Due: `+1000 points + hourly penalty`

## Future Phase (Predictive Sklearn Model)
**Training Dataset**: The `UserBehavior` table tracks exactly when tasks are created, paused, vs completed. 
**Features to Extract**:
- Time delay factor (Average time taken by user for "High" vs "Low" priority tasks).
- Task text length vs completion time.
- Time of day task is most likely completed.

**Model Approach**: We will implement a Random Forest Classifier or Decision Tree to assign a "Probability of Delay" to each task based on historical user behavior. This probability will subtract from the task's base urgency score, ensuring tasks a user habitually avoids are either highlighted as roadblocks or intelligently delegated to high-focus periods.
