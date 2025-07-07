#!/usr/bin/env python3
"""
Simple test script for the Qwen3:8b chatbot functionality
"""

import asyncio
import sys
import os

# Add the project root to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.core.llm import chatbot_service

async def test_chatbot():
    """Test the chatbot with a simple question"""
    print("Testing Qwen3:8b chatbot...")
    print("=" * 50)
    
    test_messages = [
        "Hello! How are you today?",
        "What can you help me with?",
        "Tell me a short joke",
        "What is the capital of France?"
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\nTest {i}:")
        print(f"User: {message}")
        try:
            response = await chatbot_service.generate_response(message)
            print(f"Bot: {response}")
        except Exception as e:
            print(f"Error: {e}")
        print("-" * 30)

if __name__ == "__main__":
    asyncio.run(test_chatbot())
