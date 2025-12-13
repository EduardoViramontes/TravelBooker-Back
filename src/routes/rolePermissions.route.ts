import { Router } from "express";
import { RolePermissions } from "../controllers/rolePermissions.controller";
import { JwtToken } from "../middlewares/jwtToken.middleware"
import { ValidPermissions } from "../middlewares/validPermissions.middleware"
import db from "../db";
const nameModel = db.models.RolePermissions.name

const router = Router();

router.get("/rolePermissions/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), RolePermissions.show);
router.get("/rolePermissions", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), RolePermissions.index);
router.post("/rolePermissions", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "W"), RolePermissions.store);
router.delete("/rolePermissions/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "D"), RolePermissions.delete);
router.patch("/rolePermissions/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "S"), RolePermissions.restore);


export default router;
