import asyncio
import random
import time
from typing import List, Dict
import socketio
import json

class ChaosTestScenario:
    """Base class for chaos test scenarios"""
    
    def __init__(self, host: str, room_id: str):
        self.host = host
        self.room_id = room_id
        self.clients: List[socketio.Client] = []
        self.results = []
    
    async def run(self):
        """Run the chaos test scenario"""
        raise NotImplementedError
    
    def add_result(self, scenario: str, success: bool, error: str = None):
        self.results.append({
            'scenario': scenario,
            'success': success,
            'error': error,
            'timestamp': time.time()
        })

class PacketLossScenario(ChaosTestScenario):
    """Simulate packet loss by randomly dropping messages"""
    
    async def run(self):
        print("Running Packet Loss Scenario...")
        
        # Create multiple clients
        for i in range(5):
            client = socketio.Client()
            try:
                client.connect(f"{self.host}/socket.io/")
                client.emit('join_room', {'roomId': self.room_id, 'userId': f'chaos_user_{i}'})
                self.clients.append(client)
            except Exception as e:
                self.add_result('packet_loss_connect', False, str(e))
                return
        
        # Simulate packet loss by randomly not sending some messages
        for i in range(20):
            if random.random() > 0.3:  # 30% packet loss
                try:
                    client = random.choice(self.clients)
                    client.emit('chat_message', {
                        'roomId': self.room_id,
                        'userId': client.sid,
                        'message': f'Message {i}'
                    })
                    await asyncio.sleep(0.1)
                except Exception as e:
                    self.add_result('packet_loss_message', False, str(e))
            else:
                # Simulate dropped packet
                await asyncio.sleep(0.1)
        
        # Cleanup
        for client in self.clients:
            client.disconnect()
        
        self.add_result('packet_loss', True)

class RaceConditionScenario(ChaosTestScenario):
    """Simulate race conditions with rapid concurrent operations"""
    
    async def run(self):
        print("Running Race Condition Scenario...")
        
        # Create clients that will perform rapid operations
        clients = []
        for i in range(10):
            client = socketio.Client()
            try:
                client.connect(f"{self.host}/socket.io/")
                client.emit('join_room', {'roomId': self.room_id, 'userId': f'race_user_{i}'})
                clients.append(client)
            except Exception as e:
                self.add_result('race_condition_connect', False, str(e))
                return
        
        # Simulate race conditions with concurrent operations
        async def rapid_operations(client_id: int):
            client = clients[client_id]
            try:
                # Rapid join/leave cycles
                for _ in range(5):
                    client.emit('leave_room', {'roomId': self.room_id, 'userId': f'race_user_{client_id}'})
                    await asyncio.sleep(0.01)
                    client.emit('join_room', {'roomId': self.room_id, 'userId': f'race_user_{client_id}'})
                    await asyncio.sleep(0.01)
                
                # Rapid voting changes
                vote_types = ["MCQ", "TrueFalse", "MatchPairs"]
                for _ in range(3):
                    vote_type = random.choice(vote_types)
                    client.emit('vote', {
                        'roomId': self.room_id,
                        'userId': f'race_user_{client_id}',
                        'type': vote_type
                    })
                    await asyncio.sleep(0.01)
                
            except Exception as e:
                self.add_result(f'race_condition_operations_{client_id}', False, str(e))
        
        # Run all operations concurrently
        tasks = [rapid_operations(i) for i in range(len(clients))]
        await asyncio.gather(*tasks)
        
        # Cleanup
        for client in clients:
            client.disconnect()
        
        self.add_result('race_condition', True)

class NetworkLatencyScenario(ChaosTestScenario):
    """Simulate network latency by adding delays"""
    
    async def run(self):
        print("Running Network Latency Scenario...")
        
        client = socketio.Client()
        try:
            client.connect(f"{self.host}/socket.io/")
            client.emit('join_room', {'roomId': self.room_id, 'userId': 'latency_user'})
            
            # Simulate varying network latency
            latencies = [0.1, 0.5, 1.0, 2.0, 5.0]  # seconds
            
            for latency in latencies:
                start_time = time.time()
                
                # Send message with simulated latency
                client.emit('chat_message', {
                    'roomId': self.room_id,
                    'userId': 'latency_user',
                    'message': f'Message with {latency}s latency'
                })
                
                # Wait for the simulated latency
                await asyncio.sleep(latency)
                
                end_time = time.time()
                actual_latency = end_time - start_time
                
                if abs(actual_latency - latency) < 0.1:  # Allow 100ms tolerance
                    self.add_result(f'latency_{latency}s', True)
                else:
                    self.add_result(f'latency_{latency}s', False, f'Expected {latency}s, got {actual_latency}s')
            
            client.disconnect()
            
        except Exception as e:
            self.add_result('network_latency', False, str(e))

class ConnectionDropScenario(ChaosTestScenario):
    """Simulate connection drops and reconnections"""
    
    async def run(self):
        print("Running Connection Drop Scenario...")
        
        client = socketio.Client()
        try:
            client.connect(f"{self.host}/socket.io/")
            client.emit('join_room', {'roomId': self.room_id, 'userId': 'drop_user'})
            
            # Simulate connection drops
            for i in range(3):
                # Send a message
                client.emit('chat_message', {
                    'roomId': self.room_id,
                    'userId': 'drop_user',
                    'message': f'Message before drop {i}'
                })
                
                # Simulate connection drop
                client.disconnect()
                await asyncio.sleep(1.0)
                
                # Reconnect
                client.connect(f"{self.host}/socket.io/")
                client.emit('join_room', {'roomId': self.room_id, 'userId': 'drop_user'})
                
                # Send message after reconnection
                client.emit('chat_message', {
                    'roomId': self.room_id,
                    'userId': 'drop_user',
                    'message': f'Message after reconnection {i}'
                })
                
                await asyncio.sleep(0.5)
            
            client.disconnect()
            self.add_result('connection_drop', True)
            
        except Exception as e:
            self.add_result('connection_drop', False, str(e))

async def run_all_chaos_tests(host: str, room_id: str):
    """Run all chaos test scenarios"""
    scenarios = [
        PacketLossScenario(host, room_id),
        RaceConditionScenario(host, room_id),
        NetworkLatencyScenario(host, room_id),
        ConnectionDropScenario(host, room_id)
    ]
    
    results = []
    
    for scenario in scenarios:
        try:
            await scenario.run()
            results.extend(scenario.results)
        except Exception as e:
            results.append({
                'scenario': scenario.__class__.__name__,
                'success': False,
                'error': str(e),
                'timestamp': time.time()
            })
    
    # Print results
    print("\n=== Chaos Test Results ===")
    for result in results:
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        print(f"{status} {result['scenario']}")
        if not result['success'] and result['error']:
            print(f"  Error: {result['error']}")
    
    # Summary
    passed = sum(1 for r in results if r['success'])
    total = len(results)
    print(f"\nSummary: {passed}/{total} scenarios passed")
    
    return results

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: python chaos_test.py <host> <room_id>")
        print("Example: python chaos_test.py http://localhost:3000 test_room_123")
        sys.exit(1)
    
    host = sys.argv[1]
    room_id = sys.argv[2]
    
    asyncio.run(run_all_chaos_tests(host, room_id)) 