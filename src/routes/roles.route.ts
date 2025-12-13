import { Router } from "express";
import { Roles } from "../controllers/roles.controller";
import { JwtToken } from "../middlewares/jwtToken.middleware"
import { ValidPermissions } from "../middlewares/validPermissions.middleware"
import db from "../db";
const nameModel = db.models.Roles.name

const router = Router();

router.get("/roles/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Roles.show);
router.get("/roles", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Roles.index);
router.get("/options/roles", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Roles.options);
router.post("/roles", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "W"), Roles.store);
router.delete("/roles/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "D"), Roles.delete);
router.patch("/roles/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "S"), Roles.restore);
router.put("/roles/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "U"), Roles.update);


export default router;
