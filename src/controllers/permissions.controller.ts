import { Response } from "express";
import { Filters } from "../services/filters.service"
import { Op, fn, col, where } from "sequelize";
import db from "../db";
const mainModel = db.models.Permissions

export class Permissions {

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
			const filtro = await Permissions.getFiltro(req.query,mainModel);

			const busquedaLibre: any = [];
			if (req.query.busquedaLibre !== undefined && req.query.busquedaLibre !== '' && req.query.busquedaLibre !== null) {
				const busquedaLibreTxt = req.query.busquedaLibre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
				busquedaLibre.push(where(fn("unaccent", col("model")),    { [Op.iLike]: `%${busquedaLibreTxt}%` }))
				busquedaLibre.push(where(fn("unaccent", col("descripcion")),    { [Op.iLike]: `%${busquedaLibreTxt}%` }))
				
				filtro[db.Sequelize.Op.or] = busquedaLibre;
			}
			const offset = (page - 1) * pageSize;
			const limit = pageSize;


			const docs = await mainModel.findAll({
				paranoid: false,
				page: page || 1,
				paginate: pageSize || 10,
				order: [[campoOrden, orden]],
				where: filtro,
				offset,
				limit
			});
			const dataDocs = await mainModel.count({
				paranoid: false,
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
			const filtro = await Permissions.getFiltro(req.query,mainModel);
			
			const busquedaLibre: any = [];
			if (req.query.busquedaLibre !== undefined && req.query.busquedaLibre !== '' && req.query.busquedaLibre !== null) {
				const busquedaLibreTxt = req.query.busquedaLibre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
				busquedaLibre.push(where(fn("unaccent", col("model")),    { [Op.iLike]: `%${busquedaLibreTxt}%` }))
				busquedaLibre.push(where(fn("unaccent", col("descripcion")),    { [Op.iLike]: `%${busquedaLibreTxt}%` }))
				
				filtro[db.Sequelize.Op.or] = busquedaLibre;
			}
			const offset = (page - 1) * pageSize;
			const limit = pageSize;


			const docs = await mainModel.findAll({
				paranoid: false,
				page: page || 1,
				paginate: pageSize || 10,
				order: [[campoOrden, orden]],
				where: filtro,
				offset,
				limit
			});
			const dataDocs = await mainModel.count({
				paranoid: false,
				where: filtro,
				distinct: true,
				col: 'id'
			});
			const data = []
			for(const doc of docs){
				const element = doc.toJSON()
				data.push({
					'id':element.id,
					'option': `(${element.model}-${element.tipo}) ${element.descripcion ?? ""}`.trim(),
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
	
	static async show(req: any, res: Response): Promise<any> {
		try {
			const { id } = req.params;
			if(!Number.isInteger(parseInt(id))){
				return res.status(400).send({status:false , msg: `El parametro id debe ser int.` });
			} 
			const registroEncontrado = await mainModel.findByPk(id,{ paranoid: false });
			if(registroEncontrado != null){
				const registro = registroEncontrado.toJSON()
				return res.status(200).send({ status: true, data: registro});
			}
			return res.status(404).send({ status: false, msg: "Registro no existe" });
		} catch (error) {
			return res.status(500).send({ status: false, msg: "Error interno del servidor", error: error?.toString()});
		} 
	}

}