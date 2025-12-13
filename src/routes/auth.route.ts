import { Router } from "express";
import { Auth } from "../controllers/auth.controller";
import { JwtToken } from "../middlewares/jwtToken.middleware"

const router = Router();


router.get("/auth/getCurrentUser", JwtToken.valid, JwtToken.updateToken, Auth.getCurrentUser);
router.post("/auth/login", Auth.login);
router.get("/health", Auth.health);

export default router;
