import { Model, DataTypes, Sequelize, Optional } from "sequelize";


// Se definen los atributos del modelo
interface DestinationsAttributes {
  id: string;
  name: string;
  country: string;
  city: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

//Atributos que se pueden omitir al crear un registro
interface DestinationsCreationAttributes extends Optional<DestinationsAttributes, "id" | "isActive" | "createdAt" | "updatedAt" | "deletedAt"> {}

// Se define la clase del modelo
export class Destinations extends Model<DestinationsAttributes, DestinationsCreationAttributes> implements DestinationsAttributes {
  public id!: string;
  public name!: string;
  public country!: string;
  public city!: string;
  public isActive!: boolean;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;


  // Relaciones
  static associate(models: any) {}
}

// Se Inicializa el modelo
export function initUserModel(sequelize: Sequelize) {
  Destinations.init(
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
      country: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
      tableName: "Destinations",
      paranoid: true, // habilita soft delete (deletedAt)
      timestamps: true, // habilita createdAt y updatedAt
    }
  );

  return Destinations;
}
