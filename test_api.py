#!/usr/bin/env python3
"""
Test the chatbot API endpoints
"""

import requests
import json

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api/v1"

def test_chatbot_api():
    # First, create a test user and get a token
    test_user = {
        "name": "Test User",
        "username": "testuser",
        "password": "testpass123"
    }
    
    # Try to create user (might fail if already exists)
    try:
        response = requests.post(f"{API_BASE}/user/create_user", json=test_user)
        print(f"Create user response: {response.status_code}")
    except Exception as e:
        print(f"Create user error: {e}")
    
    # Login to get token
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    
    response = requests.post(f"{BASE_URL}/auth/token", data=login_data)
    if response.status_code == 200:
        token_data = response.json()
        token = token_data["access_token"]
        print(f"Login successful, token: {token[:20]}...")
        
        # Test creating bot room
        headers = {"Authorization": f"Bearer {token}"}
        bot_room_response = requests.get(f"{API_BASE}/user/create_bot_room", headers=headers)
        print(f"Bot room response: {bot_room_response.status_code}")
        
        if bot_room_response.status_code == 200:
            room_data = bot_room_response.json()
            room_id = room_data["room_id"]
            print(f"Bot room ID: {room_id}")
            
            # Test sending message to bot
            message_data = {
                "room_id": room_id,
                "content": "Hello, how are you?"
            }
            
            chat_response = requests.post(f"{API_BASE}/user/chat_with_bot", json=message_data, headers=headers)
            print(f"Chat response: {chat_response.status_code}")
            
            if chat_response.status_code == 200:
                chat_data = chat_response.json()
                print(f"Bot response: {chat_data.get('bot_response', 'No response')}")
            else:
                print(f"Chat error: {chat_response.text}")
        else:
            print(f"Bot room error: {bot_room_response.text}")
    else:
        print(f"Login failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_chatbot_api()
