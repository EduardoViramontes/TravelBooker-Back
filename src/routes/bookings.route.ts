import { Router } from "express";
import { Bookings } from "../controllers/bookings.controller";
import { JwtToken } from "../middlewares/jwtToken.middleware"
import { ValidPermissions } from "../middlewares/validPermissions.middleware"
import db from "../db";
const nameModel = db.models.Bookings.name

const router = Router();

router.get("/bookings/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Bookings.show);
router.get("/bookings", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Bookings.index);
router.get("/options/bookings", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "R"), Bookings.options);
router.post("/bookings", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "W"), Bookings.store);
router.delete("/bookings/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "D"), Bookings.delete);
router.patch("/bookings/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "S"), Bookings.restore);
router.put("/bookings/:id", JwtToken.valid, JwtToken.updateToken, ValidPermissions.valid(nameModel, "U"), Bookings.update);


export default router;
