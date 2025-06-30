from datetime import datetime, timedelta
from typing import Dict

class SRSManager:
    """Manages the Spaced Repetition System logic"""
    
    def __init__(self):
        # SRS stages and their intervals
        self.stages = {
            "Child": timedelta(hours=4),
            "Student": timedelta(hours=8),
            "Scholar": timedelta(days=1),
            "Enlightened": timedelta(days=3),
            "Burned": None  # Items in burned stage don't need reviews
        }
        
        # Stage progression order
        self.stage_order = ["Child", "Student", "Scholar", "Enlightened", "Burned"]
    
    def get_next_review_time(self, stage: str, last_review: datetime) -> datetime:
        """Calculate the next review time based on SRS stage"""
        if stage == "Burned":
            # Burned items don't need further reviews
            return last_review + timedelta(days=365 * 10)  # Far future date
        
        interval = self.stages.get(stage, timedelta(hours=4))
        return last_review + interval
    
    def advance_stage(self, current_stage: str) -> str:
        """Advance to the next SRS stage"""
        try:
            current_index = self.stage_order.index(current_stage)
            if current_index < len(self.stage_order) - 1:
                return self.stage_order[current_index + 1]
            return current_stage  # Already at highest stage
        except ValueError:
            return "Child"  # Default to Child if stage not found
    
    def demote_stage(self, current_stage: str) -> str:
        """Demote to the previous SRS stage on incorrect answer"""
        try:
            current_index = self.stage_order.index(current_stage)
            if current_index > 0:
                return self.stage_order[current_index - 1]
            return current_stage  # Already at lowest stage
        except ValueError:
            return "Child"  # Default to Child if stage not found
    
    def get_stage_info(self) -> Dict[str, str]:
        """Get human-readable information about each SRS stage"""
        return {
            "Child": "4 hours - Just learned",
            "Student": "8 hours - Getting familiar",
            "Scholar": "1 day - Well understood",
            "Enlightened": "3 days - Nearly mastered",
            "Burned": "Mastered - No more reviews needed"
        }