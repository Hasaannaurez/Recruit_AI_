from typing import Dict, Any
from .base_agent import BaseAgent

class ProfileAgent(BaseAgent):
    def __init__(self,instructions):
        super().__init__(
            name="Profile Agent",
            instructions=instructions
        )
        print("Profile Agent: Initialized")
    
    async def run(self, messages: list) -> Dict[str, Any]:
        """Process the resume and extract relevant details"""
        print("Profile Agent: Processing resume and extracting general details")
        
        # Get structured information from the LLM
        response = await self._query_llm(messages,temp=0.5,max_tokens=4096)
        general_details = self._parse_json_safely(response.choices[0].message.content)
        
        return {"general_details": general_details}
