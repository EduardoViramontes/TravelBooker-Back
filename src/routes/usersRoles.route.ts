import { Router } from "express";
import { UsersRoles } from "../controllers/usersRoles.controller";
import { JwtToken } from "../middlewares/jwtToken.middleware"
import { ValidPermissions } from "../middlewares/validPermissions.middleware"
import db from "../db";
const nameModel = db.models.UsersRoles.name

const router = Router();

router.get("/usersRoles/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), UsersRoles.show);
router.get("/usersRoles", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), UsersRoles.index);
router.post("/usersRoles", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "W"), UsersRoles.store);
router.delete("/usersRoles/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "D"), UsersRoles.delete);
router.patch("/usersRoles/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "S"), UsersRoles.restore);


export default router;
