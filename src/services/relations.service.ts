import { Model, Op, IncludeOptions } from "sequelize";


interface RelacionesInclude extends IncludeOptions {
    as: string;
    model: any;
    include?: any;
    attributes?: { exclude: string[] };
    where?: any;
    required?: boolean;
}

class Relations {
    static relacionesModel: { [key: string]: string } = {
        "destination": "Destinations",
        "permission": "Permissions",
        "permissions": "Permissions",
        "role": "Roles",
        "roles": "Roles",
        "user": "Users",
        "createdByUser": "Users",
    };

    relacionesValidas: string[] = [];
    parametros: string[] = [];
    models: { [key: string]: typeof Model } = {};
    agregarUsuarioRegistro: boolean = true;

    constructor(
        relacionesValidas: string[],
        parametros: string[],
        models: { [key: string]: typeof Model },
        agregarUsuarioRegistro = true
    ) {
        this.relacionesValidas = relacionesValidas;
        this.parametros = parametros;
        this.models = models;
        this.agregarUsuarioRegistro = agregarUsuarioRegistro;
    }

    async getRelaciones(modelo: any, filtro: any) {
        try {
            filtro = JSON.parse(filtro);
        } catch (error) {
            filtro = {};
        }
        

        const relacionesValidadas: string[] = [];
        for (let relacion of this.parametros) {
            if (this.relacionesValidas.includes(relacion.trim())) {
                relacionesValidadas.push(relacion.trim());
            }
        }

        const relacionesModels: RelacionesInclude[] = [];

        for (const relacion of relacionesValidadas) {
            let relaciones = relacion.trim().split(".");
            const main = relaciones[0];
            relaciones.shift();
            let rel: any;
            let haveIt = false;

            if (relacionesModels.length > 0) {
                for (const relModels of relacionesModels) {
                    if (relModels.as !== main) {
                        rel = { model: this.models[Relations.relacionesModel[main]], as: main };
                        if (Relations.relacionesModel[main] === "Users") {
                            rel.attributes = { exclude: ["password"] };
                        } 
                    } else {
                        rel = relModels;
                        haveIt = true;
                    }
                }
            } else {
                rel = { model: this.models[Relations.relacionesModel[main]], as: main };
                if (Relations.relacionesModel[main] === "Users") {
                    rel.attributes = { exclude: ["password"] };
                }
            }

            if (!haveIt) {
                rel = await this.agregarP(rel!, relaciones);
                relacionesModels.push(rel);
            } else if (rel.include !== undefined) {
                rel.include = await this.subAgregar(rel.include, relaciones);
            }
        }

        try {
            return await this.agregarFiltrosWhereRelaciones(
                Relations.setRequiredFalse(relacionesModels, modelo, filtro, modelo),
                filtro,
                this.models,
                modelo
            );
        } catch (error) {
            return relacionesModels;
        }
    }

    static setRequiredFalse(
        include: RelacionesInclude[] | RelacionesInclude,
        modelo: typeof Model | null,
        filtro: any,
        mainModel: typeof Model | null
    ): RelacionesInclude[] | RelacionesInclude {
        if (!Array.isArray(include)) return include;

        return include.map(item => {
            if (typeof item.required === 'undefined') {
                const { isInFilter, fil } = Relations.findFilter(filtro, item.as);
                const asociaciones = modelo?.associations || {};
                const asociacionSelect = Object.values(asociaciones).find(
                    (asociacion: any) => asociacion.target.name == item.model.name
                );

                if (isInFilter && asociacionSelect?.associationType === "BelongsTo") {
                    const path = Relations.findPath(mainModel!, fil.property.split("."), new Set());
                    const rels = [...path];
                    const validAsociacion = rels.find(rel => rel.target.name === asociacionSelect.target.name);
                    const validModelo = rels.find(rel => rel.target.name === modelo?.name);
                    let isFullBelongsTo = true;
                    if (validAsociacion && validModelo) {
                        for (const rel of rels) isFullBelongsTo = isFullBelongsTo && rel.associationType === "BelongsTo";
                    }
                    item.required = rels.length == 1 || true;
                    if (item.include && !Array.isArray(item.include) && fil.property.split(".").length > 2)
                        item.include.required = true;
                } else if (isInFilter && asociacionSelect?.associationType === "HasMany") {
                    const path = Relations.findPath(mainModel!, fil.property.split("."), new Set());
                    const rels = [...path];
                    item.required = rels.length == 1 || true;
                }

                if(asociacionSelect?.associationType === "BelongsToMany"){
                    item.through = { attributes: [] }
                    if (item.include && !Array.isArray(item.include))
                        item.include.through = { attributes: [] }
                }
            }

            if (item.include && item.include.length > 0) {
                item.include = Relations.setRequiredFalse(item.include, item.model, filtro, mainModel);
            }

            return item;
        });
    }

    static findPath(mainModel: typeof Model, partes: string[], path: Set<any>): Set<any> {
        const as = partes[0];
        partes.shift();
        if (partes.length === 0) return path;

        const asociaciones = mainModel.associations;
        const asociacionSelect = Object.values(asociaciones).find((asociacion: any) => asociacion.as === as);
        if (asociacionSelect) {
            path.add(asociacionSelect);
            mainModel = asociacionSelect.target;
        }
        return Relations.findPath(mainModel, partes, path);
    }

    static findFilter(filtro: any, as: string): any {
        for (const key of Object.keys(filtro)) {
            const filtros = filtro[key];
            for (const fil of filtros) {
                if (fil.or !== undefined) return Relations.findFilter(fil, as);
                else {
                    const list = Array.isArray(fil.property.split(".")) ? fil.property.split(".") : [];
                    if (as === fil.property || list.includes(as)) return { isInFilter: true, fil };
                }
            }
        }
        return false;
    }

    async agregarFiltrosWhereRelaciones(
        relacionesModels: any,
        filtro: any,
        models: { [key: string]: typeof Model },
        modeloPadre: typeof Model | null
    ): Promise<any> {
        if (!filtro || typeof filtro !== "object") return relacionesModels;

        const condiciones = [...(filtro.and || []), ...(filtro.or || [])];
        let where: any = null;
        let modelWhere: typeof Model | null = null;
        let modeloAux: typeof Model | null = null;

        for (const condicion of condiciones) {
            if (condicion.or) {
                await this.agregarFiltrosWhereRelaciones(relacionesModels, { and: condicion.or }, models, modeloPadre);
                continue;
            }

            if (!condicion.property) continue;

            const partes = condicion.property.split(".");
            if (partes.length < 2) continue;

            const campoFinal = partes.pop()!;
            try {
                const data = await Relations.getWhere(
                    campoFinal,
                    condicion,
                    relacionesModels,
                    condicion.property.split("."),
                    models,
                    modeloPadre
                );
                where = data?.where ?? null;
                modelWhere = data?.modelWhereAux ?? null;
                modeloAux = data?.modeloAux ?? null;

                if (where != null && modelWhere == null) {
                    const resultado = Relations.buscarIncludeYModelo(relacionesModels, condicion.property.split("."), models, modeloPadre!);
                    if (!resultado) continue;

                    const { includeTarget, modeloActual } = resultado;
                    const asociacion = Object.values(modeloActual.associations || {}).find(a => a.as === includeTarget.as);
                    if (!asociacion) continue;

                    const esHasMany = ["HasMany"].includes(asociacion.associationType);
                    const op = Relations.obtenerOperador(condicion.operator);
                    const clausula = { [campoFinal]: { [op]: condicion.value } };
                    if (esHasMany) {
                        if (!includeTarget.where) includeTarget.where = {};
                        Object.assign(includeTarget.where, clausula);
                    }
                }
            } catch (error) {
                continue;
            }
        }

        let noEncontrado = true;
        relacionesModels = relacionesModels.map((item: any) => {
            if (where && modelWhere && item.model.name === modelWhere.name) {
                noEncontrado = false;
                item.where = where;
            }
            return item;
        });

        return relacionesModels.map((item: any) => {
            if (where && modelWhere && item.model.name === modeloAux?.name && noEncontrado) {
                for (const element of item.include || []) {
                    if (element.model.name === modelWhere.name) {
                        noEncontrado = false;
                        element.where = where;
                    }
                }
            }
            return item;
        });
    }

    static async getWhere(
        campoFinal: string,
        condicion: any,
        relacionesModels: RelacionesInclude[],
        partes: string[],
        models: { [key: string]: typeof Model },
        modeloPadre: typeof Model | null,
        whereInt: any = null
    ): Promise<any> {
        const resultado = Relations.buscarIncludeYModelo(relacionesModels, partes, models, modeloPadre!);
        if (!resultado) return null;

        const { includeTarget, modeloActual } = resultado;
        const asociacion: any = Object.values(modeloActual.associations).find(a => a.as === includeTarget.as);
        const op = Relations.obtenerOperador(condicion.operator);
        const clausula = whereInt == null
            ? { [campoFinal]: { [op]: condicion.operator === "like" ? `%${condicion.value}%` : condicion.value } }
            : whereInt;

        const regs = await asociacion.target.findAll({ where: clausula });
        const ids: any[] = [];
        for (const reg of regs) {
            if (!ids.includes(reg.id)) ids.push(reg.id);
        }

        let where: any;
        let modelWhereAux;
        if (regs.length === 0) regs.push(-1);

        if (regs.length > 0) {
            where = { deletedAt: null };
            where[asociacion.foreignKey] = ids;
            modelWhereAux = asociacion.target;

            if (asociacion.associationType === "BelongsTo") {
                partes.splice(-1, 1);
                partes.splice(-1, 1);
                partes.push("id");
                return await Relations.getWhere("id", condicion, relacionesModels, partes, models, modeloPadre, where);
            } else {
                return { where: clausula, modelWhereAux: asociacion.target, modeloAux: modeloActual };
            }
        }
        return { includeTarget, modeloActual: modeloPadre, where: clausula, modelWhereAux };
    }

    static buscarIncludeYModelo(
        includes: RelacionesInclude[] | RelacionesInclude,
        partes: string[],
        models: { [key: string]: typeof Model },
        modeloPadre: typeof Model
    ): { includeTarget: RelacionesInclude; modeloActual: typeof Model } | null {
        if (!Array.isArray(includes)) includes = [includes];
        const current = partes[0];
        const rest = partes.slice(1);

        const include = includes.find(inc => inc.as === current);
        if (!include) return null;

        const modeloActual = models[Relations.relacionesModel[include.as]];
        if (!modeloActual) return null;

        if (rest.length === 1) {
            return { includeTarget: include, modeloActual: modeloPadre };
        }
        if (!include.include) return null;

        return Relations.buscarIncludeYModelo(include.include, rest, models, modeloActual);
    }

    static obtenerOperador(operator?: string) {
        const map: { [key: string]: symbol } = {
            "==": Op.eq,
            "!=": Op.ne,
            ">": Op.gt,
            ">=": Op.gte,
            "<": Op.lt,
            "<=": Op.lte,
            "like": Op.iLike,
            "in": Op.in,
            "notIn": Op.notIn
        };
        return map[operator || "=="] || Op.eq;
    }

    async agregarP(rel: RelacionesInclude, relaciones: string[]): Promise<RelacionesInclude> {
        const subMain = relaciones[0];
        if (subMain) {
            relaciones.shift();
            rel.include = { model: this.models[Relations.relacionesModel[subMain]], as: subMain };
            if (Relations.relacionesModel[subMain] === "Users") {
                rel.include.attributes = { exclude: ["password"] };
            } 

            if (relaciones.length > 0) rel.include = await this.agregarP(rel.include, relaciones);
        }
        return rel;
    }

    async subAgregar(rel: any, relaciones: string[]): Promise<RelacionesInclude[] | RelacionesInclude> {
        const subMain = relaciones[0];
        if (!subMain) return rel;

        relaciones.shift();
        if (!Array.isArray(rel)) {
            const relAux = rel;
            rel = [relAux];
            const aux = rel.find((r:any) => r.as === subMain);
            let newRel: RelacionesInclude = { model: this.models[Relations.relacionesModel[subMain]], as: subMain };
            if (Relations.relacionesModel[subMain] === "Users") newRel.attributes = { exclude: ["password"] };

            newRel = await this.agregarP(newRel, relaciones);

            if (!aux) rel.push(newRel);
            else {
                if (Array.isArray(aux.include)) {
                    if (!Array.isArray(newRel.include)) aux.include.push(newRel.include);
                    else for (const include of newRel.include) aux.include.push(include);
                } else {
                    const includeAux = aux.include;
                    aux.include = [];
                    aux.include.push(includeAux);
                    if (!Array.isArray(newRel.include)) aux.include.push(newRel.include);
                    else for (const include of newRel.include) aux.include.push(include);
                }
            }
        } else {
            let haveIt = false;
            for (const include of rel) {
                if (include.as === subMain) haveIt = true;
            }
            if (!haveIt) {
                let newRel: RelacionesInclude = { model: this.models[Relations.relacionesModel[subMain]], as: subMain };
                if (Relations.relacionesModel[subMain] === "Users") newRel.attributes = { exclude: ["password"] };

                newRel = await this.agregarP(newRel, relaciones);
                rel.push(newRel);
            }
        }

        if (relaciones.length > 0) {
            const indice = (rel as RelacionesInclude[]).findIndex(objeto => objeto.as === subMain);
            (rel as RelacionesInclude[])[indice].include = await this.subAgregar((rel as RelacionesInclude[])[indice].include!, relaciones);
        }

        return rel;
    }
}

export { Relations };
