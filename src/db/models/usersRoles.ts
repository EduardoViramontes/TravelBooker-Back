import { Model, DataTypes, Sequelize, Optional } from "sequelize";

// Se definen los atributos del modelo
interface UserRolesAttributes {
  id: string;
  idUser: number;
  idRole: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

//Atributos que se pueden omitir al crear un registro
interface UserRolesCreationAttributes extends Optional<UserRolesAttributes, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}

// Se define la clase del modelo
export class UsersRoles extends Model<UserRolesAttributes, UserRolesCreationAttributes> implements UserRolesAttributes {
  public id!: string;
  public idUser!: number;
  public idRole!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;


  // Relaciones
  static associate(models: any) {
    UsersRoles.belongsTo(models.Users, { foreignKey: "idUser", as: "user" });
    UsersRoles.belongsTo(models.Roles, { foreignKey: "idRole", as: "role" });
  }
}

// Se Inicializa el modelo
export function initUserModel(sequelize: Sequelize) {
  UsersRoles.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      idUser: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
              model: 'Users',
              key: 'id'
          }
      },
      idRole: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
              model: 'Roles',
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
      tableName: "UsersRoles",
      paranoid: true, // habilita soft delete (deletedAt)
      timestamps: true, // habilita createdAt y updatedAt
    }
  );

  return UsersRoles;
}
