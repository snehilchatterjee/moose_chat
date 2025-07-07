import ollama
from typing import Optional
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

logger = logging.getLogger(__name__)

class ChatbotService:
    def __init__(self, model_name: str = "qwen3:8b"):
        self.model_name = model_name
        self.executor = ThreadPoolExecutor(max_workers=2)
        
    async def generate_response(self, message: str, context: Optional[str] = None, conversation_history: Optional[list] = None) -> str:
        """Generate a response using Ollama with Qwen3:8b model"""
        try:
            # Build conversation context
            conversation_context = ""
            if conversation_history:
                for msg in conversation_history[-10:]:  # Use last 10 messages for context
                    role = "User" if msg.get("is_user", True) else "Assistant"
                    conversation_context += f"{role}: {msg['content']}\n"
            
            # Create a more conversational prompt with history
            prompt = f"""You are a helpful and friendly chatbot. You should respond in a conversational manner based on the conversation history.

Conversation History:
{conversation_context}

Current User Message: {message}

Please respond as a helpful assistant:"""
            
            # Run the synchronous ollama call in a thread pool
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                self.executor, 
                self._generate_sync, 
                prompt
            )
            
            return response.strip()
            
        except Exception as e:
            logger.error(f"Error generating chatbot response: {e}")
            return "I'm sorry, I'm having trouble responding right now. Please try again later."
    
    def _generate_sync(self, prompt: str) -> str:
        """Synchronous wrapper for ollama generate"""
        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    'temperature': 0.7,
                    'max_tokens': 150,
                    'top_p': 0.9
                }
            )
            # Clean up the response by removing thinking tags
            raw_response = response['response']
            # Remove <think>...</think> blocks
            import re
            cleaned_response = re.sub(r'<think>.*?</think>', '', raw_response, flags=re.DOTALL)
            return cleaned_response.strip()
        except Exception as e:
            logger.error(f"Ollama generation error: {e}")
            return "I'm sorry, I encountered an error while generating a response."

# Global instance
chatbot_service = ChatbotService()
