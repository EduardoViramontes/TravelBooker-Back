import { Router } from "express";
import { Destinations } from "../controllers/destinations.controller";
import { JwtToken } from "../middlewares/jwtToken.middleware"
import { ValidPermissions } from "../middlewares/validPermissions.middleware"
import db from "../db";
const nameModel = db.models.Destinations.name

const router = Router();

router.get("/destinations/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Destinations.show);
router.get("/destinations", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Destinations.index);
router.get("/options/destinations", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Destinations.options);
router.post("/destinations", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "W"), Destinations.store);
router.delete("/destinations/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "D"), Destinations.delete);
router.patch("/destinations/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "S"), Destinations.restore);
router.put("/destinations/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "U"), Destinations.update);


export default router;
