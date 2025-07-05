# Load Testing Infrastructure

This directory contains comprehensive load testing and chaos engineering tools for the QuizMania multiplayer system.

## 📁 Structure

```
tests/load/
├── locustfile.py          # Main Locust load test script
├── scenarios/
│   └── chaos_test.py      # Chaos engineering scenarios
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

```bash
# Install Python dependencies
pip install locust python-socketio asyncio

# Or using requirements.txt
pip install -r requirements.txt
```

### Running Load Tests

```bash
# Start Locust web interface
locust -f locustfile.py --host=http://localhost:3000

# Run headless load test
locust -f locustfile.py --host=http://localhost:3000 --headless --users 50 --spawn-rate 5 --run-time 60s

# Run specific user class
locust -f locustfile.py --host=http://localhost:3000 --headless --users 10 --spawn-rate 2 --run-time 30s --user-class MultiplayerUser
```

### Running Chaos Tests

```bash
# Run all chaos scenarios
python scenarios/chaos_test.py http://localhost:3000 test_room_123

# Run specific scenario (modify the script)
python scenarios/chaos_test.py http://localhost:3000 test_room_123
```

## 📊 Test Scenarios

### Load Test Scenarios

#### 1. MultiplayerUser
- **Purpose**: Simulate normal multiplayer behavior
- **Tasks**:
  - Join rooms and chat (weight: 3)
  - Vote on game types (weight: 2)
  - Burst join/leave cycles (weight: 1)
- **Wait Time**: 1-3 seconds between tasks

#### 2. ChatSpamUser
- **Purpose**: Test moderation and rate limiting
- **Tasks**:
  - Rapid chat spam (weight: 10)
- **Wait Time**: 0.1-0.5 seconds between tasks

### Chaos Test Scenarios

#### 1. Packet Loss Scenario
- **Simulates**: 30% packet loss
- **Tests**: Message delivery reliability
- **Duration**: ~2 seconds

#### 2. Race Condition Scenario
- **Simulates**: Rapid concurrent operations
- **Tests**: Join/leave cycles, voting changes
- **Duration**: ~1 second

#### 3. Network Latency Scenario
- **Simulates**: Varying network latency (0.1s to 5s)
- **Tests**: System behavior under high latency
- **Duration**: ~10 seconds

#### 4. Connection Drop Scenario
- **Simulates**: Connection drops and reconnections
- **Tests**: Reconnection handling and state recovery
- **Duration**: ~5 seconds

## 🎯 Performance Targets

### Load Test Targets
- **Response Time**: < 100ms for 95% of requests
- **Error Rate**: < 1% for normal operations
- **Throughput**: 1000+ concurrent users
- **Memory Usage**: < 2GB for WebSocket server

### Chaos Test Targets
- **Recovery Time**: < 5 seconds after connection drop
- **Message Loss**: < 5% under packet loss
- **State Consistency**: 100% after race conditions
- **Latency Tolerance**: Graceful degradation under high latency

## 📈 Monitoring

### Metrics to Track
1. **WebSocket Connections**
   - Active connections
   - Connection rate
   - Disconnection rate

2. **Message Delivery**
   - Messages sent/received
   - Delivery latency
   - Failed deliveries

3. **Room Management**
   - Active rooms
   - Join/leave operations
   - Room creation/deletion

4. **System Resources**
   - CPU usage
   - Memory usage
   - Network I/O

### Grafana Dashboards
- Use the dashboards in `infra/monitoring/grafana/`
- Monitor real-time metrics during tests
- Set up alerts for performance thresholds

## 🔧 Configuration

### Environment Variables
```bash
# Load test configuration
LOCUST_HOST=http://localhost:3000
LOCUST_USERS=50
LOCUST_SPAWN_RATE=5
LOCUST_RUN_TIME=60s

# Chaos test configuration
CHAOS_TEST_HOST=http://localhost:3000
CHAOS_TEST_ROOM_ID=test_room_123
```

### Custom Scenarios
To add custom scenarios:

1. **Load Test**: Add new user classes to `locustfile.py`
2. **Chaos Test**: Create new scenario classes in `scenarios/chaos_test.py`

Example custom load test:
```python
class CustomUser(HttpUser):
    wait_time = between(2, 5)
    
    @task
    def custom_operation(self):
        # Your custom test logic
        pass
```

Example custom chaos test:
```python
class CustomChaosScenario(ChaosTestScenario):
    async def run(self):
        # Your custom chaos logic
        pass
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if WebSocket server is running
curl http://localhost:3000/healthz

# Check server logs
docker logs ws-server
```

#### 2. High Error Rate
- Check server resources (CPU, memory)
- Verify Redis connection
- Check for rate limiting issues

#### 3. Slow Response Times
- Monitor database performance
- Check network latency
- Verify WebSocket server configuration

### Debug Mode
```bash
# Enable debug logging
export DEBUG=socket.io:*
locust -f locustfile.py --host=http://localhost:3000 --loglevel=DEBUG
```

## 📋 Test Checklist

Before running tests:
- [ ] WebSocket server is running
- [ ] Redis is connected
- [ ] Database is accessible
- [ ] Monitoring is set up
- [ ] Test environment is isolated

After running tests:
- [ ] Check error rates
- [ ] Verify performance targets
- [ ] Review system logs
- [ ] Update performance baselines
- [ ] Document any issues found

## 🔄 CI/CD Integration

### GitHub Actions
Add to your workflow:
```yaml
- name: Run Load Tests
  run: |
    locust -f tests/load/locustfile.py --host=${{ secrets.TEST_HOST }} --headless --users 10 --spawn-rate 2 --run-time 30s

- name: Run Chaos Tests
  run: |
    python tests/load/scenarios/chaos_test.py ${{ secrets.TEST_HOST }} test_room_123
```

### Performance Gates
Set up performance gates in CI:
- Response time < 100ms
- Error rate < 1%
- Memory usage < 2GB

## 📚 Additional Resources

- [Locust Documentation](https://docs.locust.io/)
- [Socket.IO Testing](https://socket.io/docs/v4/testing/)
- [Chaos Engineering Principles](https://principlesofchaos.org/)
- [Performance Testing Best Practices](https://k6.io/docs/testing-guides/)

## 🤝 Contributing

When adding new tests:
1. Follow the existing patterns
2. Add comprehensive documentation
3. Include error handling
4. Test edge cases
5. Update this README

## 📞 Support

For issues with load testing:
1. Check the troubleshooting section
2. Review server logs
3. Verify configuration
4. Contact the development team 