import { Router } from "express";
import { Usuarios } from "../controllers/users.controller";
import { JwtToken } from "../middlewares/jwtToken.middleware"
import { ValidPermissions } from "../middlewares/validPermissions.middleware"
import db from "../db";
const nameModel = db.models.Users.name

const router = Router();

router.get("/users/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Usuarios.show);
router.get("/users", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Usuarios.index);
router.get("/options/users", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Usuarios.options);
router.post("/users", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "W"), Usuarios.store);
router.delete("/users/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "D"), Usuarios.delete);
router.patch("/users/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "S"), Usuarios.restore);
router.put("/users/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "U"), Usuarios.update);


export default router;
