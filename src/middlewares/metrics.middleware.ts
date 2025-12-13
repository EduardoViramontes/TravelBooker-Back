import { Request, Response, NextFunction } from "express";
import {
  httpRequestCounter,
  httpRequestDuration,
} from "../metrics/prometheus";

export const metricsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const endTimer = httpRequestDuration.startTimer();

  res.on("finish", () => {
    const route =
      req.route?.path ||
      req.baseUrl ||
      req.path ||
      "unknown";

    httpRequestCounter.inc({
      method: req.method,
      route,
      status: res.statusCode,
    });

    endTimer({
      method: req.method,
      route,
      status: res.statusCode,
    });
  });

  next();
};
