import { Router } from "express";
import { Permissions } from "../controllers/permissions.controller";
import { JwtToken } from "../middlewares/jwtToken.middleware"
import { ValidPermissions } from "../middlewares/validPermissions.middleware"
import db from "../db";
const nameModel = db.models.Permissions.name

const router = Router();

router.get("/permissions/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Permissions.show);
router.get("/permissions", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Permissions.index);
router.get("/options/permissions", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Permissions.options);


export default router;
