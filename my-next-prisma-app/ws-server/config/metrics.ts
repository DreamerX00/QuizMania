import client, { Counter, Gauge, Histogram, collectDefaultMetrics } from 'prom-client';

// Initialize default metrics once
collectDefaultMetrics();

// Technical metrics
export const requestCounter = new Counter({ name: 'ws_server_requests_total', help: 'Total WS connection requests' });
export const errorCounter = new Counter({ name: 'ws_server_errors_total', help: 'Total WS errors' });
export const requestDuration = new Histogram({ name: 'ws_server_request_duration_seconds', help: 'WS connection duration (seconds)' });
export const activeConnections = new Gauge({ name: 'ws_server_active_connections', help: 'Active WS connections' });

// Business metrics
export const activeRooms = new Gauge({ name: 'ws_server_active_rooms', help: 'Active rooms' });
export const activeUsers = new Gauge({ name: 'ws_server_active_users', help: 'Active users (approx.)' });
export const messagesTotal = new Counter({ name: 'ws_server_messages_total', help: 'Total chat messages sent' });
export const votesTotal = new Counter({ name: 'ws_server_votes_total', help: 'Total votes cast' });

export const metricsRegistry = client.register;
