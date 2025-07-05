from locust import HttpUser, task, between, events
import socketio
import json
import time
import random
from typing import Dict, Any

class SocketIOClient:
    def __init__(self, host: str):
        self.sio = socketio.Client()
        self.host = host
        self.connected = False
        self.room_id = None
        self.user_id = None
        
    def connect(self, user_id: str):
        self.user_id = user_id
        try:
            self.sio.connect(f"{self.host}/socket.io/")
            self.connected = True
            return True
        except Exception as e:
            print(f"Connection failed: {e}")
            return False
    
    def join_room(self, room_id: str):
        if not self.connected:
            return False
        try:
            self.sio.emit('join_room', {'roomId': room_id, 'userId': self.user_id})
            self.room_id = room_id
            return True
        except Exception as e:
            print(f"Join room failed: {e}")
            return False
    
    def send_chat(self, message: str):
        if not self.connected or not self.room_id:
            return False
        try:
            self.sio.emit('chat_message', {
                'roomId': self.room_id,
                'userId': self.user_id,
                'message': message
            })
            return True
        except Exception as e:
            print(f"Send chat failed: {e}")
            return False
    
    def vote(self, vote_type: str):
        if not self.connected or not self.room_id:
            return False
        try:
            self.sio.emit('vote', {
                'roomId': self.room_id,
                'userId': self.user_id,
                'type': vote_type
            })
            return True
        except Exception as e:
            print(f"Vote failed: {e}")
            return False
    
    def disconnect(self):
        if self.connected:
            self.sio.disconnect()
            self.connected = False

class MultiplayerUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        self.socket_client = None
        self.user_id = f"test_user_{random.randint(1000, 9999)}"
        self.room_id = f"test_room_{random.randint(100, 999)}"
        
    @task(3)
    def join_room_and_chat(self):
        """Simulate users joining rooms and chatting"""
        if not self.socket_client:
            self.socket_client = SocketIOClient(self.client.base_url)
            if not self.socket_client.connect(self.user_id):
                return
        
        # Join room
        if self.socket_client.join_room(self.room_id):
            time.sleep(0.5)
            
            # Send some chat messages
            messages = [
                "Hello everyone!",
                "Ready to play!",
                "Good luck!",
                "Nice game!",
                "GG!"
            ]
            
            for _ in range(random.randint(1, 3)):
                message = random.choice(messages)
                self.socket_client.send_chat(message)
                time.sleep(random.uniform(0.5, 2.0))
    
    @task(2)
    def voting_scenario(self):
        """Simulate voting in rooms"""
        if not self.socket_client:
            self.socket_client = SocketIOClient(self.client.base_url)
            if not self.socket_client.connect(self.user_id):
                return
        
        if self.socket_client.join_room(self.room_id):
            time.sleep(0.5)
            
            # Vote on different game types
            vote_types = ["MCQ", "TrueFalse", "MatchPairs", "Audio", "Essay"]
            vote_type = random.choice(vote_types)
            self.socket_client.vote(vote_type)
            time.sleep(random.uniform(1.0, 3.0))
    
    @task(1)
    def burst_join_leave(self):
        """Simulate burst of users joining and leaving"""
        if not self.socket_client:
            self.socket_client = SocketIOClient(self.client.base_url)
            if not self.socket_client.connect(self.user_id):
                return
        
        # Rapid join/leave cycles
        for _ in range(random.randint(2, 5)):
            self.socket_client.join_room(self.room_id)
            time.sleep(0.1)
            self.socket_client.disconnect()
            time.sleep(0.1)
            self.socket_client.connect(self.user_id)
    
    def on_stop(self):
        if self.socket_client:
            self.socket_client.disconnect()

class ChatSpamUser(HttpUser):
    wait_time = between(0.1, 0.5)  # Faster for spam simulation
    
    def on_start(self):
        self.socket_client = None
        self.user_id = f"spam_user_{random.randint(1000, 9999)}"
        self.room_id = f"test_room_{random.randint(100, 999)}"
    
    @task(10)
    def spam_chat(self):
        """Simulate chat spam for moderation testing"""
        if not self.socket_client:
            self.socket_client = SocketIOClient(self.client.base_url)
            if not self.socket_client.connect(self.user_id):
                return
        
        if self.socket_client.join_room(self.room_id):
            # Send rapid messages
            spam_messages = [
                "SPAM!",
                "TEST MESSAGE",
                "REPEAT",
                "QUICK MESSAGE",
                "FAST CHAT"
            ]
            
            for _ in range(random.randint(3, 8)):
                message = random.choice(spam_messages)
                self.socket_client.send_chat(message)
                time.sleep(0.05)  # Very fast
    
    def on_stop(self):
        if self.socket_client:
            self.socket_client.disconnect()

# Event listeners for monitoring
@events.request.add_listener
def my_request_handler(request_type, name, response_time, response_length, response, context, exception, start_time, url, **kwargs):
    if exception:
        print(f"Request failed: {name} - {exception}")
    else:
        print(f"Request successful: {name} - {response_time}ms")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("Load test starting...")

@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("Load test completed.") 