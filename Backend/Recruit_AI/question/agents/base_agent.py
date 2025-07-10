from typing import Dict, Any
import asyncio
import json
from openai import OpenAI


class BaseAgent:
    def __init__(self, name: str, instructions: str):
        self.name = name
        self.instructions = instructions
        self.client = OpenAI()

    async def run(self, messages: list) -> Dict[str, Any]:
        """Default run method to be overridden by child classes"""
        raise NotImplementedError("Subclasses must implement run()")

    async def _query_llm(self, prompt: str, temp=0.7, max_tokens = 2000, model = "gpt-4o-mini") -> str:
        """Query Ollama model with the given prompt asynchronously"""
        try:
            response = await asyncio.to_thread(self.client.chat.completions.create, 
                                            model= model,
                                            messages=[
                                                {"role": "system", "content": self.instructions},
                                                {"role": "user", "content": prompt},
                                            ],
                                            temperature=temp,
                                            max_tokens=max_tokens)
            print("Done!")
            print(f"input tokens : {response.usage.prompt_tokens}\toutput tokens : {response.usage.completion_tokens}")
            return response
        except Exception as e:
            print(f"Error querying Ollama: {str(e)}")
            raise

    def _parse_json_safely(self, text: str) -> Dict[str, Any]:
        """Safely parse JSON from text, handling potential errors"""
        try:
            # Try to find JSON-like content between curly braces
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1:
                json_str = text[start : end + 1]
                return json.loads(json_str)
            return {"error": "No JSON content found"}
        except json.JSONDecodeError:
            return {"error": "Invalid JSON content"}
        except:
            return {"error": "some other error returned"}
