import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export enum PermissionType {
  READ = 'R',
  WRITE = 'W',
  UPDATE = 'U',
  DELETE = 'D',
  RESTORE = 'S'
}

// Se definen los atributos del modelo
interface PermissionsAttributes {
  id: string;
  model: string;
  descripcion: string;
  tipo: PermissionType;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

//Atributos que se pueden omitir al crear un registro
interface PermissionsCreationAttributes extends Optional<PermissionsAttributes, "id" | "createdAt" | "updatedAt" | "deletedAt"> {}

// Se define la clase del modelo
export class Permissions extends Model<PermissionsAttributes, PermissionsCreationAttributes> implements PermissionsAttributes {
  public id!: string;
  public model!: string;
  public descripcion!: string;
  public tipo!: PermissionType;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;


  // Relaciones
  static associate(models: any) {
  }
}

// Se Inicializa el modelo
export function initUserModel(sequelize: Sequelize) {
  Permissions.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      model: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tipo: {
          type: DataTypes.ENUM('R', 'W', 'U', 'D', 'S'),
          allowNull: false,
          defaultValue: PermissionType.READ,
          comment: 'R => Read, W => Write, U => Update, D => Delete, S => Restore. Default "R"'
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
      tableName: "Permissions",
      paranoid: true, // habilita soft delete (deletedAt)
      timestamps: true, // habilita createdAt y updatedAt
    }
  );

  return Permissions;
}
