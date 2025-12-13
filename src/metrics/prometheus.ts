import client from "prom-client";

client.collectDefaultMetrics({
  prefix: "api_",
});

export const httpRequestCounter = new client.Counter({
  name: "api_http_requests_total",
  help: "Total de requests HTTP",
  labelNames: ["method", "route", "status"],
});

export const httpRequestDuration = new client.Histogram({
  name: "api_http_request_duration_seconds",
  help: "Duración de requests HTTP",
  labelNames: ["method", "route", "status"],
  buckets: [0.1, 0.3, 0.5, 1, 1.5, 2, 5],
});

export const register = client.register;
