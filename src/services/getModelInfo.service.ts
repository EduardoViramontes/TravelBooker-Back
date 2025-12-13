import { Model, ModelStatic, ModelAttributeColumnOptions, } from "sequelize";

interface FieldInfo {
  key: string;
  value: string;
  required: boolean;
  enumValues?: string[];
}

export function getModelFieldsInfo<T extends Model>(
  model: ModelStatic<T>,
  isUpdate: boolean = false
): FieldInfo[] {
  const attributes = model.getAttributes();
  const result: FieldInfo[] = [];
  const update: any = {
    "Destinations": ["customerName","customerEmail","destinationId","status","travelDate", "isActive"],
    "Bookings": ["customerName","customerEmail","idDestination","travelDate","status"],
    "Permissions": [],
    "Roles": [ "descripcion"],
    "RolePermissions": [],
    "Users": [ "name", "password", "status"],
    "UsersRoles": [],
  }

  for (const [key, rawColumn] of Object.entries(attributes)) {
    if(["deletedAt", "id"].includes(key) || (!update[model.name].includes(key) && isUpdate) ) continue
    const column = rawColumn as ModelAttributeColumnOptions;

    let typeName = "unknown";
    let modelReference: any = undefined
    let length: number | undefined = undefined;
    let format: string | undefined = undefined

    const t = column.type as any;

    if (t && typeof t === "object") {
      if ("key" in t) {
        if(column.references !== undefined){
          typeName = "model";
          modelReference = column.references
        }else{
          typeName = (model.name === "Users" || model.name === "Bookings") && (key == "email" || key == "customerEmail") ?  "email" : t.key;
          if(t.key == "DATEONLY" || t.key == "DATE") {
            format = t.key == "DATEONLY" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm:ss"
          } else if(t.key.toLowerCase() == "string"){
            length = t.options.length
          }
        }
      }
    } else if (typeof t === "string") {
      typeName = model.name === "Users" && key == "email" ?  "email" : t ;
    }
    const hasDefault = column.defaultValue !== undefined && column.defaultValue !== null;

    const allowNull = column.allowNull === true;

    const required = isUpdate ? !isUpdate : key !== "deletedAt" && !allowNull && !hasDefault ? true : false;

    result.push({
      key,
      value: typeName,
      required,
      ...(length ? { length } : {}),
      ...(modelReference ? { modelReference } : {}),
      ...(format ? { format } : {}),
    });
  }

  return result;
}
