import { Response } from "express";
import bcrypt from "bcryptjs";
import { getModelFieldsInfo } from "../services/getModelInfo.service";
import { Valid } from "../services/valid.service";
import { Filters } from "../services/filters.service"
import { Relations } from "../services/relations.service"
import { Op, fn, col, where } from "sequelize";
import db from "../db";
const mainModel = db.models.Users

export class Usuarios {

	static async index(req: any, res: Response): Promise<any> {
		try {
			const rawPage = Number(req.query.page);
			const rawPageSize = Number(req.query.pageSize);
			const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
			const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10;
			let orden = req.query.orden;
			if(orden != 'ASC' && orden != 'DESC'){
				orden = 'ASC';
			}
			
			let campoOrden: any = req.query.campoOrden || "createdAt";
			const camposModelo = Object.keys(mainModel.rawAttributes);
			if(!camposModelo.includes(campoOrden)){
				campoOrden = 'createdAt';
			}
			const filtro = await Usuarios.getFiltro(req.query,mainModel);
			
			const busquedaLibre: any = [];
			if (req.query.busquedaLibre !== undefined && req.query.busquedaLibre !== '' && req.query.busquedaLibre !== null) {
				const busquedaLibreTxt = req.query.busquedaLibre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
				busquedaLibre.push(where(fn("unaccent", col("Users.name")),    { [Op.iLike]: `%${busquedaLibreTxt}%` }))
				busquedaLibre.push(where(fn("unaccent", col("Users.email")),    { [Op.iLike]: `%${busquedaLibreTxt}%` }))
				
				filtro[db.Sequelize.Op.or] = busquedaLibre;
			}

			const offset = (page - 1) * pageSize;
			const limit = pageSize;
			const relsValidas = [ 'roles.permissions' ]
			const findRelaciones = new Relations(relsValidas,relsValidas,db.models)
			const relaciones = await findRelaciones.getRelaciones(mainModel, req.query.filter)



			const docs = await mainModel.findAll({
				paranoid: false,
				page: page || 1,
				attributes: { exclude: ['password'] },
				include: relaciones,
				paginate: pageSize || 10,
				order: [[campoOrden, orden]],
				where: filtro,
				offset,
				limit
			});
			const dataDocs = await mainModel.count({
				paranoid: false,
				attributes: { exclude: ['password'] },
				include: relaciones,
				where: filtro,
				distinct: true,
				col: 'id'
			});


			const totalCount = dataDocs;
			
			const totalPages = Math.ceil(totalCount / pageSize);
			const nextPage = page < totalPages ? page + 1 : null;
			const prevPage = page > 1 ? page - 1 : null;
			const rutaData = req.originalUrl.split('?')
			const fullUrl = `${req.protocol}://${req.get('host')}${rutaData[0]}`;
			const nextPageUrl = nextPage ? `${fullUrl}?page=${nextPage}&pageSize=${pageSize}&orden=${orden}` + ((req.query.filter != '' && req.query.filter != undefined) ? `&filter=${req.query.filter}`:'') : null;
			const prevPageUrl = prevPage ? `${fullUrl}?page=${prevPage}&pageSize=${pageSize}&orden=${orden}` + ((req.query.filter != '' && req.query.filter != undefined) ? `&filter=${req.query.filter}`:'') : null;


			return res.status(200).send({
				status: true,
				currentPage: page,
				nextPage: nextPageUrl,
				prevPage: prevPageUrl,
				pages: totalPages,
				total: totalCount,
				data: docs
			});
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}

	static async getFiltro(parametros: any,modelo: any){
		let filtro
		try {
			filtro = JSON.parse(parametros.filter)
		} catch (error) {
			filtro = undefined
		}
		const eliminados = parametros.eliminados;

		const Filter = new Filters({filtros:filtro,eliminados:eliminados,modelo:modelo})
		return Filter.get()
	}

	static async options(req: any, res: Response): Promise<any> {
		try {
			const rawPage = Number(req.query.page);
			const rawPageSize = Number(req.query.pageSize);
			const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;
			const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0 ? rawPageSize : 10;
			let orden = req.query.orden;
			if(orden != 'ASC' && orden != 'DESC'){
				orden = 'ASC';
			}
			
			let campoOrden: any = req.query.campoOrden || "createdAt";
			const camposModelo = Object.keys(mainModel.rawAttributes);
			if(!camposModelo.includes(campoOrden)){
				campoOrden = 'createdAt';
			}
			const filtro = await Usuarios.getFiltro(req.query,mainModel);
			
			const busquedaLibre: any = [];
			if (req.query.busquedaLibre !== undefined && req.query.busquedaLibre !== '' && req.query.busquedaLibre !== null) {
				const busquedaLibreTxt = req.query.busquedaLibre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
				busquedaLibre.push(where(fn("unaccent", col("Users.name")),    { [Op.iLike]: `%${busquedaLibreTxt}%` }))
				busquedaLibre.push(where(fn("unaccent", col("Users.email")),    { [Op.iLike]: `%${busquedaLibreTxt}%` }))
				
				filtro[db.Sequelize.Op.or] = busquedaLibre;
			}
			const offset = (page - 1) * pageSize;
			const limit = pageSize;


			const docs = await mainModel.findAll({
				paranoid: false,
				page: page || 1,
				attributes: { exclude: ['password'] },
				//include: relaciones,
				paginate: pageSize || 10,
				order: [[campoOrden, orden]],
				where: filtro,
				offset,
				limit
			});
			const dataDocs = await mainModel.count({
				paranoid: false,
				attributes: { exclude: ['password'] },
				where: filtro,
				distinct: true,
				col: 'id'
			});
			const data = []
			for(const doc of docs){
				const element = doc.toJSON()
				data.push({
					'id':element.id,
					'option': `(${element.name}) ${element.email}`.trim(),
				})
			}


			const totalCount = dataDocs;
			
			const totalPages = Math.ceil(totalCount / pageSize);
			const nextPage = page < totalPages ? page + 1 : null;
			const prevPage = page > 1 ? page - 1 : null;
			const rutaData = req.originalUrl.split('?')
			const fullUrl = `${req.protocol}://${req.get('host')}${rutaData[0]}`;
			const nextPageUrl = nextPage ? `${fullUrl}?page=${nextPage}&pageSize=${pageSize}&orden=${orden}` + ((req.query.filter != '' && req.query.filter != undefined) ? `&filter=${req.query.filter}`:'') : null;
			const prevPageUrl = prevPage ? `${fullUrl}?page=${prevPage}&pageSize=${pageSize}&orden=${orden}` + ((req.query.filter != '' && req.query.filter != undefined) ? `&filter=${req.query.filter}`:'') : null;


			return res.status(200).send({
				status: true,
				currentPage: page,
				nextPage: nextPageUrl,
				prevPage: prevPageUrl,
				pages: totalPages,
				total: totalCount,
				data: data
			});
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}

	static async store(req: any, res: Response): Promise<any> {
		try {
			const params = req.body;
			params.status = true
			const fields = getModelFieldsInfo(mainModel);
			const valid = new Valid(fields,params)
			const respValid = await valid.toValid();
			if(respValid.msg !== undefined){
				return res.status(400).send(respValid);
			}
			const registrosEncontrados = await mainModel.findAll({
				where: {
					email:respValid.email,
					deletedAt: null
				}
			});
			if(registrosEncontrados.length > 0){
				return res.status(400).send({ status: false, msg: "Registro existente"});
			}
			respValid.password = await bcrypt.hash(respValid.password, await bcrypt.genSalt(10));
			const nuevoRegistro  = await mainModel.create(respValid);
			if(Array.isArray(params.roles)){
				for(const role of params.roles){
					const rol = await db.models.Roles.findByPk(role)
					if(rol != null){
						const rolSaved = await db.models.UsersRoles.findOne({ where: {
							idUser: nuevoRegistro.id,
							idRole: rol.id
						}})
						if(rolSaved == null){
							await db.models.UsersRoles.create({
								idUser: nuevoRegistro.id,
								idRole: rol.id
							})
						}
					}
				}
			}
			return res.status(200).send({ status: true, msg: "Elemento registrado correctamente", data: {id:nuevoRegistro.id}});
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}
	
	static async show(req: any, res: Response): Promise<any> {
		try {
			const { id } = req.params;
			if(!Number.isInteger(parseInt(id))){
				return res.status(400).send({status:false , msg: `El parametro id debe ser int.` });
			} 
			const relsValidas = [ 'roles.permissions' ]
			const findRelaciones = new Relations(relsValidas,relsValidas,db.models)
			const relaciones = await findRelaciones.getRelaciones(mainModel, req.query.filter)
			const registroEncontrado = await mainModel.findByPk(id,{ paranoid: false, include:relaciones, attributes: { exclude: ['password'] } });
			if(registroEncontrado != null){
				const registro = registroEncontrado.toJSON()
				return res.status(200).send({ status: true, data: registro});
			}
			return res.status(404).send({ status: false, msg: "Registro no existe" });
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}
	
	static async delete(req: any, res: Response): Promise<any> {
		try {
			const { id } = req.params;
			if(!Number.isInteger(parseInt(id))){
				return res.status(400).send({status:false , msg: `El parametro id debe ser int.` });
			} 
			const registroEncontrado = await mainModel.findByPk(id,{ paranoid: false });
			if(registroEncontrado != null){
				let canDelete = true
				const modelosUtilizados: any = []
				for (const modelo of Object.values(db.models) as any) {
					let asociaciones = modelo.associations
					for (const asociacion of Object.values(asociaciones) as any) {
						if(asociacion.target.name == mainModel.name){
							let where: any = {}
							if(asociacion.associationType == 'BelongsToMany'){
								where[asociacion.foreignKey] = registroEncontrado.id
								let encontrados = await asociacion.through.model.findAll({ where: where });
								if(encontrados.length > 0 && !modelosUtilizados.includes(modelo.name)){
									canDelete = false
									modelosUtilizados.push(modelo.name)
								}
							}else if(asociacion.associationType != 'HasMany'){
								where[asociacion.foreignKey] = registroEncontrado.id
								let encontrados = await modelo.findAll({ where: where });
								if(encontrados.length > 0 && !modelosUtilizados.includes(modelo.name)){
									canDelete = false
									modelosUtilizados.push(modelo.name)
								}
							}
						}
					}
				}
				if(!canDelete){
					return res.status(400).send({ status: false, msg: `No se pudo eliminar. El elemento actualmente está siendo referenciado en los modelos [${modelosUtilizados}].` });
				}
				if(registroEncontrado.deletedAt != null){
					return res.status(400).send({ status: false, msg: "Registro eliminado" });
				}
				await registroEncontrado.destroy({ where: { id: id } });
				return res.status(200).send({ status: true, msg: "Registro eliminado con éxito"});
			}
			return res.status(404).send({ status: false, msg: "Registro no existe" });
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}
	
	static async restore(req: any, res: Response): Promise<any> {
		try {
			const { id } = req.params;
			if(!Number.isInteger(parseInt(id))){
				return res.status(400).send({status:false , msg: `El parametro id debe ser int.` });
			} 
			const registroEncontrado = await mainModel.findByPk(id,{ paranoid: false });
			if(registroEncontrado != null){
				if(registroEncontrado.deletedAt != null){
					const registrosEncontrados = await mainModel.findAll({
						where: {
							id: {
                                [db.Sequelize.Op.ne]: id, 
                            },
							email:registroEncontrado.email,
							deletedAt: null
						}
					});

					if(registrosEncontrados.length > 0){
						return res.status(400).send({ status: false, msg: "Registro existente"});
					}
					await registroEncontrado.restore();
					return res.status(200).send({ status: true, msg: "Registro restaurado con éxito"});
				}
				return res.status(400).send({ status: false, msg: "Registro no eliminado" });
			}
			return res.status(404).send({ status: false, msg: "Registro no existe" });
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}
	
	static async update(req: any, res: Response): Promise<any> {
		try {
			const { id } = req.params;
			if(!Number.isInteger(parseInt(id))){
				return res.status(400).send({status:false , msg: `El parametro id debe ser int.` });
			} 
			const registroEncontrado = await mainModel.findByPk(id,{ paranoid: false });
			if(registroEncontrado != null){
				if(registroEncontrado.deletedAt != null){
					return res.status(400).send({ status: false, msg: "Registro eliminado" });
				}
				const params = req.body;
				const fields = getModelFieldsInfo(mainModel, true);
				const valid = new Valid(fields,params)
				const respValid = await valid.toValid();
				if(respValid.msg !== undefined){
					return res.status(400).send(respValid);
				}
				if(respValid.password !== undefined){
					respValid.password = await bcrypt.hash(respValid.password, await bcrypt.genSalt(10));
				}
				if(respValid.status === false){
					if(id == req.usuario.id) return res.status(400).send({ status: false, msg: "No se puede desactivar al usuario activo." });
				}
				await registroEncontrado.update(respValid, { where: { id: id } });
				return res.status(200).send({ status: true, msg: "Registro editado con éxito"});
			}
			return res.status(404).send({ status: false, msg: "Registro no existe" });
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}

}