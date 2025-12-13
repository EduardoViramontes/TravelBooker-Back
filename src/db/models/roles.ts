import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export enum RolesType {
  READ = 'R',
  WRITE = 'W',
  UPDATE = 'U',
  DELETE = 'D',
  RESTORE = 'S'
}

// Se definen los atributos del modelo
interface RolessAttributes {
  id: string;
  name: string;
  descripcion: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

//Atributos que se pueden omitir al crear un registro
interface RolessCreationAttributes extends Optional<RolessAttributes, "id" | "descripcion" | "createdAt" | "updatedAt" | "deletedAt"> {}

// Se define la clase del modelo
export class Roles extends Model<RolessAttributes, RolessCreationAttributes> implements RolessAttributes {
  public id!: string;
  public name!: string;
  public descripcion!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;


  // Relaciones
  static associate(models: any) {
    Roles.belongsToMany(models.Users, {
      through: models.UsersRoles,
      foreignKey: "idRole",
      otherKey: "idUser",
      as: "users"
    });
    Roles.belongsToMany(models.Permissions, {
      through: models.RolePermissions,
      foreignKey: "idRole",
      otherKey: "idPermission",
      as: "permissions"
    });
  }
}

// Se Inicializa el modelo
export function initUserModel(sequelize: Sequelize) {
  Roles.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
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
      tableName: "Roles",
      paranoid: true, // habilita soft delete (deletedAt)
      timestamps: true, // habilita createdAt y updatedAt
    }
  );

  return Roles;
}
