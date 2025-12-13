import { Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { Valid } from "../services/valid.service";
import { Relations } from "../services/relations.service"
import { HealthService } from "../services/health.service";
import db from "../db";
import { sequelize } from "../db";
const mainModel = db.models.Users

export class Auth {

	static async login(req: any, res: Response): Promise<any> {
		try {
			const params = req.body;
			params.email = params.email.toLowerCase()
			const fields = [
				{ key: 'email', value: 'email', required: true },
  				{ key: 'password', value: 'STRING', required: true }
			];
			const valid = new Valid(fields,params)
			const respValid = await valid.toValid();
			if(respValid.msg !== undefined){
				return res.status(400).send(respValid);
			}
			const relsValidas = [ 'roles.permissions' ]
			const findRelaciones = new Relations(relsValidas,relsValidas,db.models)
			const relaciones = await findRelaciones.getRelaciones(mainModel, req.query.filter)
			const registroEncontrado = await mainModel.findOne({ where: { email: respValid.email, deletedAt: null }, include: relaciones });
			if(registroEncontrado == undefined){
				return res.status(401).json({ status:false, msg: 'Credenciales inválidas' });
			}
			if (!bcrypt.compareSync(params.password, registroEncontrado.password)) {
				return res.status(401).json({ status:false, msg: 'Credenciales inválidas' });
			}
			if(!registroEncontrado.status){
				return res.status(403).json({ status:false, msg: 'Esta cuenta está desactivada.' });
			}
			const user = registroEncontrado.toJSON()
			user.password = undefined
			const duracionToken = { expiresIn: process.env.JWT_EXPIRES_IN }
			const dataToken = { idUsuario: registroEncontrado.id, email: registroEncontrado.email}
			const token = jwt.sign(dataToken, process.env.JWT_SECRET || "", duracionToken as SignOptions);
			return res.status(200).json( { status:true, token:token,  user: user} )
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}

	static async getCurrentUser(req: any, res: Response): Promise<any> {
		try {
			const relsValidas = [ 'roles.permissions' ]
			const findRelaciones = new Relations(relsValidas,relsValidas,db.models)
			const relaciones = await findRelaciones.getRelaciones(mainModel, req.query.filter)
			const registroEncontrado = await mainModel.findOne({ where: { id: req.user.id, email: req.user.email, deletedAt: null }, attributes: { exclude: ['password'] }, include: relaciones });
			if(registroEncontrado == undefined){
				return res.status(401).json({ status:false, msg: 'Credenciales inválidas' });
			}
			if(!registroEncontrado.status){
				return res.status(403).json({ status:false, msg: 'Esta cuenta está desactivada.' });
			}
			return res.status(200).json( { status:true, user: registroEncontrado} )
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}

	static async health(req: any, res: Response): Promise<any> {
		try {
			const checks = {
				database: async () => {
					try {
						await sequelize.authenticate();
					return true;
					} catch {
						return false;
					}
				}
			};
			const healthService = new HealthService(checks);
			const status = await healthService.getStatus();
			res.status(status.status ? 200 : 500).json(status);
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}

}