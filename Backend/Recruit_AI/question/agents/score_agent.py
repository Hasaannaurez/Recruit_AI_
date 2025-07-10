from typing import Dict, Any
import json
import asyncio
from openai import OpenAI

class ScoreAgent:
    def __init__(self, model: str = "gpt-4o-mini"):
        self.name = "Score Agent"
        self.client = OpenAI()
        self.model = model
        print("Score Agent: Initialized")
    
    async def run(self, messages: list) -> Dict[str, Any]:
        """
        messages: a list of dicts with keys "role" and "content", e.g.:
          [
            {"role": "system", "content": self.instructions},
            {"role": "user",   "content": context_prompt},
            {"role": "user",   "content": score_prompt}
          ]
        """
        print("Score Agent: Processing resume and evaluating candidate")
        try:
            # Send all messages—including system and user roles—directly to the LLM
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=messages,
                temperature=0.4,
                max_tokens=2000
            )
            print("Done!")
            print(f"input tokens : {response.usage.prompt_tokens}\toutput tokens : {response.usage.completion_tokens}")
            content = response.choices[0].message.content
            parsed = self._parse_json_safely(content)
            return {"score_details": parsed}
        except Exception as e:
            print(f"Error querying LLM: {e}")
            raise

    def _parse_json_safely(self, text: str) -> Dict[str, Any]:
        """Safely extract and parse the first JSON object in the LLM's response."""
        try:
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                return json.loads(text[start:end+1])
            return {"error": "No JSON content found"}
        except json.JSONDecodeError:
            return {"error": "Invalid JSON content"}
        except Exception:
            return {"error": "Unknown parsing error"}
