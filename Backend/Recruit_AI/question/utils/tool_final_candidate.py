def get_final_candidate(general_details,score_details,feedback_details):
    return {
            "general_details": general_details.get("general_details", general_details),
            "score_details":  score_details.get("score_details",  score_details),
            "feedback_details": feedback_details.get("feedback_details", feedback_details),
        }