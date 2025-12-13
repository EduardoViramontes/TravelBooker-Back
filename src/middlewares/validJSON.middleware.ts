import { Response, NextFunction, Request } from "express";

export class ValidJson {
  static async valid(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (req.headers["content-type"] === "application/json") {
      res.status(400).json({ error: "El cuerpo de la solicitud no es un JSON válido" });
    } else {
      const message = err instanceof Error ? err.stack : "Unknown error";
      res.status(500).json({ error: message });
    }
  }
}
