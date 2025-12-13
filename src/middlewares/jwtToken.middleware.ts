import { Response, NextFunction } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import db from "../db";
const mainModel = db.models.Users

export class JwtToken {
  constructor() {}

  static async valid(req: any, res: Response, next: NextFunction) {
    if(!req.headers.authorization){
      return res.status(401).send({status:false , msg:'Token no válido'});
    }else {
		try {
			const token  = req.headers.authorization.split(" ")
			if(token[0] != 'Bearer'){
				return res.status(401).send({status:false , msg:'Token no válido'});
			}
			const decodedToken: any = jwt.verify(token[1], process.env.JWT_SECRET || "");
			if(decodedToken.exp === undefined && process.env.NODE_ENV == 'producction'){
				return res.status(403).send({status:false , msg:'Token expirado'});
			}
			const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
			if (decodedToken.exp && decodedToken.exp < currentTime) {
				return res.status(403).send({status:false , msg:'Token expirado'});
			}
			
			const usuario = await mainModel.findOne({ where:{id:decodedToken.idUsuario, email: decodedToken.email}, attributes: { exclude: ['password'] }});
			if(!usuario.status){
				return res.status(403).json({ status:false, msg: 'Esta cuenta está desactivada.' });
			}
			if(usuario != undefined){
				req.user= usuario.toJSON();
			}else{
				return res.status(401).send({status:false , msg:'Token no válido'});
			}
			next();
		} catch (error) {
			return res.status(401).send({status:false , msg:'Token no válido'});
		}
	}
  }

  static async updateToken(req: any, res: Response, next: NextFunction) {
    if(req.user!== undefined){
		const duracionToken = { expiresIn: process.env.JWT_EXPIRES_IN }
		const dataToken = { idUsuario: req.user.id, email: req.user.email}
		const token = jwt.sign(dataToken, process.env.JWT_SECRET || "", duracionToken as SignOptions);
		res.setHeader('x-token', 'Bearer ' + token);
	}
	next()
  }

  static async validPermmission(req: any, res: Response, next: NextFunction) {
    if(req.user!== undefined){
		const duracionToken = { expiresIn: process.env.JWT_EXPIRES_IN }
		const dataToken = { idUsuario: req.user.id, email: req.user.email}
		const token = jwt.sign(dataToken, process.env.JWT_SECRET || "", duracionToken as SignOptions);
		res.setHeader('x-token', 'Bearer ' + token);
	}
	next()
  }

}
