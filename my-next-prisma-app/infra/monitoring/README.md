# Monitoring & Observability

This directory contains configs and dashboards for Prometheus and Grafana monitoring of ws-server, Redis, and LiveKit.

## Setup

1. **Prometheus**
   - Use `prometheus.yml` as your config.
   - Ensure ws-server exposes /metrics on port 4000, Redis on 6379, and LiveKit on 7880.
   - Start Prometheus with:
     ```
     prometheus --config.file=prometheus.yml
     ```

2. **Redis Exporter**
   - The included `docker-compose.yml` runs `redis_exporter` on port 9121.
   - Prometheus scrapes Redis metrics from this exporter.

3. **LiveKit Metrics**
   - LiveKit exposes `/metrics` natively if enabled in its config. See [LiveKit docs](https://docs.livekit.io/cloud/reference/monitoring/).

4. **Grafana**
   - Add Prometheus as a data source.
   - Import dashboards from the `grafana/` directory.
   - Visualize SLOs, latency, error rates, Redis stats, and business metrics.
   - **Authentication:**
     - Edit `grafana.ini` or set environment variables:
       ```
       [security]
       admin_user = admin
       admin_password = strongpassword
       ```
     - Restart Grafana after changing credentials.

5. **Alerting**
   - Use `alerting-rules.yml` for Prometheus alertmanager.
   - Alerts: high error rate, CPU/mem, Redis eviction, LiveKit fallback.

## Business Metrics
- The expanded dashboard includes panels for active rooms, users, messages, and votes.
- You must instrument these metrics in ws-server using `prom-client` (see ws-server/index.ts for examples).

## Best Practices
- Set up alert notifications (Slack, email, PagerDuty, etc.).
- Tune scrape intervals and retention for your scale.
- Extend dashboards for business metrics (XP, matches, etc.).

## References
- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [Redis Exporter](https://github.com/oliver006/redis_exporter)
- [LiveKit Monitoring](https://docs.livekit.io/cloud/reference/monitoring/) 