import { Response, NextFunction } from "express";
import db from "../db";
import { Relations } from "../services/relations.service"
const mainModel = db.models.Users

export class ValidPermissions {
  constructor() {}

  static valid(nameModel: string, type: string) {
	return async function (req: any, res: Response, next: NextFunction) {
		const relsValidas = [ 'roles.permissions' ]
		const findRelaciones = new Relations(relsValidas,relsValidas,db.models)
		const relaciones = await findRelaciones.getRelaciones(mainModel, req.query.filter)
		const registroEncontrado = await mainModel.findByPk(req.user.id,{ paranoid: false, include:relaciones, attributes: { exclude: ['password'] } });
		const user = registroEncontrado.toJSON()
		const havePermission = user.roles?.some((role: any) =>
			role.permissions?.some(
				(perm: any) =>
				perm.model === nameModel && perm.tipo === type
			)
		);
		if(havePermission){
            next();
        }else{
            return res.status(403).send({status:false , msg:'El usuario no cuenta con ningún rol con el permiso para realizar esa acción.'});
        }
    };
  }

}
