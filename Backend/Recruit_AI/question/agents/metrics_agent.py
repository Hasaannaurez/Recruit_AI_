from typing import Dict, Any
from .base_agent import BaseAgent

class MetricsAgent(BaseAgent):
    def __init__(self,instructions):
        super().__init__(
            name="Metrics Agent",
            instructions=instructions
        )
        print("Metrics Agent: Initialized")
    
    async def run(self, messages: list) -> Dict[str, Any]:
        """Process the job description and aspects and design strategies to evaluate candidates"""
        print("Metrics Agent: Processing job description and paramters")
        
        # Get structured information from the LLM
        response = await self._query_llm(messages,temp=0.7,max_tokens=4096)
        metrics_details = self._parse_json_safely(response.choices[0].message.content)
        
        return metrics_details