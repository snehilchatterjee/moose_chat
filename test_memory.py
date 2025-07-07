#!/usr/bin/env python3
"""
Test the chatbot conversation memory
"""

import requests
import json

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_conversation_memory():
    # Login
    login_data = {
        "username": "testuser",
        "password": "testpass123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
    if response.status_code != 200:
        print("Login failed")
        return
        
    token_data = response.json()
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Get bot room
    bot_room_response = requests.get(f"{API_BASE}/user/create_bot_room", headers=headers)
    room_data = bot_room_response.json()
    room_id = room_data["room_id"]
    
    # Test conversation with memory
    messages = [
        "Hi, my name is Alice",
        "What's my name?",
        "I like pizza. What about you?",
        "What food did I say I like?"
    ]
    
    for i, msg in enumerate(messages, 1):
        print(f"\n--- Message {i} ---")
        print(f"User: {msg}")
        
        message_data = {
            "room_id": room_id,
            "content": msg
        }
        
        response = requests.post(f"{API_BASE}/user/chat_with_bot", json=message_data, headers=headers)
        if response.status_code == 200:
            chat_data = response.json()
            bot_response = chat_data.get('bot_response', 'No response')
            print(f"Bot: {bot_response}")
        else:
            print(f"Error: {response.text}")

if __name__ == "__main__":
    test_conversation_memory()
