import { db } from "../db";
import moment from "moment-timezone";
import { Model, Op } from "sequelize";

interface FilterCondition {
    property: string;
    operator: string;
    value: any;
    and?: FilterCondition[];
    or?: FilterCondition[];
}

interface FilterParams {
    filtros?: FilterCondition | FilterCondition[];
    eliminados?: string;
    modelo?: typeof Model | null;
}

class Filters {
    static operadores: { [key: string]: symbol } = {
      "==": Op.eq,
      "!=": Op.ne,
      ">=": Op.gte,
      ">": Op.gt,
      "<=": Op.lte,
      "<": Op.lt,
      "like": Op.iLike,
      "notlike": Op.notILike,
    };

    filtros: FilterCondition | FilterCondition[] | undefined;
    eliminados: string | undefined;
    modelo: typeof Model | null | undefined;

    constructor({ filtros, eliminados, modelo = null }: FilterParams) {
        this.filtros = filtros;
        this.eliminados = eliminados;
        this.modelo = modelo;
    }

    get(): any {
        try {
            const respuesta = Filters.buildWhere(this.filtros, this.modelo) as any;
            const filtro: any = respuesta;

            if (this.eliminados === 'false' || this.eliminados === undefined) {
                filtro.deletedAt = null;
            } else if (this.eliminados === 'only') {
                filtro.deletedAt = {
                    [db.Sequelize.Op.ne]: null,
                };
            }

            return filtro;
        } catch (error) {
            return {};
        }
    }

    static buildWhere(
        filters: FilterCondition | FilterCondition[] | undefined,
        modelo: typeof Model | null | undefined
    ): any | any[] | null {
        if (!filters) return {};

        const parseCondition = (cond: FilterCondition, modelo: typeof Model | null | undefined): any | null => {
            if (cond.and) {
                return { [db.Sequelize.Op.and]: cond.and.map(f => Filters.buildWhere(f, modelo)).filter(Boolean) };
            }

            if (cond.or) {
                return { [db.Sequelize.Op.or]: cond.or.map(f => Filters.buildWhere(f, modelo)).filter(Boolean) };
            }

            const propertyList = cond.property.includes('.') ? cond.property.split(".") : [];
            let isHasMany = false;
            let modeloAux = modelo;

            for (const prop of propertyList) {
                const asociacion = modeloAux?.associations[prop] ?? null;
                if (asociacion != null) {
                    isHasMany = isHasMany || asociacion.associationType === "HasMany" || asociacion.associationType === "BelongsToMany";
                    modeloAux = asociacion.target;
                    if (isHasMany) return null;
                }
            }

            const field = cond.property.includes('.') ? `$${cond.property}$` : cond.property;

            try {
                if (moment(cond.value, 'YYYY-MM-DD HH:mm', true).isValid()) {
                    const aux = moment.utc(cond.value, 'YYYY-MM-DD HH:mm').format("YYYY-MM-DD HH:mm:ss");
                    cond.value = aux;
                } else if (moment(cond.value, 'YYYY-MM-DD', true).isValid()) {
                    const aux = moment.utc(cond.value, 'YYYY-MM-DD').startOf('day').format("YYYY-MM-DD HH:mm:ss");
                    cond.value = aux;
                }
            } catch (error) {}

            const campo: { [key: symbol]: any } = {};
            campo[Filters.operadores[cond.operator] ?? Filters.operadores[cond.operator.toLowerCase()]] =
                cond.operator !== "like" ? cond.value : `%${cond.value}%`;

            return { [field]: campo };
        };

        if ((filters as FilterCondition).and || (filters as FilterCondition).or) {
            const result: any = {};

            if ((filters as FilterCondition).and) {
                const and = (filters as FilterCondition).and!.map(f => Filters.buildWhere(f, modelo)).filter(Boolean);
                if (and.length > 0) result[db.Sequelize.Op.and] = and;
            }

            if ((filters as FilterCondition).or) {
                const or = (filters as FilterCondition).or!.map(f => Filters.buildWhere(f, modelo)).filter(Boolean);
                if (or.length > 0) result[db.Sequelize.Op.or] = or;
            }

            return result;
        }

        if (Array.isArray(filters)) {
            return filters.map(f => parseCondition(f, modelo)).filter(Boolean) as any[];
        }

        return parseCondition(filters as FilterCondition, modelo);
    }
}

export { Filters };
