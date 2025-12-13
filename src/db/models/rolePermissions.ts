import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// Se definen los atributos del modelo
interface RolePermissionsAttributes {
  id: string;
  idRole: number;
  idPermission: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

//Atributos que se pueden omitir al crear un registro
interface RolePermissionsCreationAttributes extends Optional<RolePermissionsAttributes, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}

// Se define la clase del modelo
export class RolePermissions extends Model<RolePermissionsAttributes, RolePermissionsCreationAttributes> implements RolePermissionsAttributes {
  public id!: string;
  public idRole!: number;
  public idPermission!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;


  // Relaciones
  static associate(models: any) {
    RolePermissions.belongsTo(models.Roles, { foreignKey: "idRole", as: "role" });
    RolePermissions.belongsTo(models.Permissions, { foreignKey: "idPermission", as: "permissions" });
  }
}

// Se Inicializa el modelo
export function initModel(sequelize: Sequelize) {
  RolePermissions.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      idRole: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
              model: 'Roles',
              key: 'id'
          }
      },
      idPermission: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
              model: 'Permissions',
              key: 'id'
          }
      },
      createdAt: {
        type: DataTypes.DATE(3),
        allowNull: false,
        defaultValue: new Date(),
      },
      updatedAt: {
        type: DataTypes.DATE(3),
        allowNull: false,
        defaultValue: new Date(),
      },
      deletedAt: {
        type: DataTypes.DATE(3),
        allowNull: true,
        defaultValue: null,
      }
    },
    {
      sequelize,
      tableName: "RolesPermissions",
      paranoid: true, // habilita soft delete (deletedAt)
      timestamps: true, // habilita createdAt y updatedAt
    }
  );

  return RolePermissions;
}
