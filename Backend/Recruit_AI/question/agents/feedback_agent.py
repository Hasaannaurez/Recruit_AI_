from typing import Dict, Any
from .base_agent import BaseAgent

class FeedbackAgent(BaseAgent):
    def __init__(self,instructions):
        super().__init__(
            name="Feedback Agent",
            instructions=instructions
        )
        print("Feedback Agent: Initialized")
    
    async def run(self, messages: list) -> Dict[str, Any]:
        """Process the resume and job details generating feedback on candidates fit"""
        print("Feedback Agent: Processing resume and job details generating feedback on candidates fit")
        
        # Get structured information from the LLM
        response = await self._query_llm(messages,temp=0.5)
        feedback_details = self._parse_json_safely(response.choices[0].message.content)
        
        return {"feedback_details": feedback_details}
