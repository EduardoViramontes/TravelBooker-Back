import { Model, DataTypes, Sequelize, Optional } from "sequelize";

export enum BookingsType {
  READ = 'R',
  WRITE = 'W',
  UPDATE = 'U',
  DELETE = 'D',
  RESTORE = 'S'
}

// Se definen los atributos del modelo
interface BookingsAttributes {
  id: string;
  customerName: string;
  customerEmail: string;
  idDestination: number;
  status: boolean;
  travelDate: Date;
  idCreatedByUser: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

//Atributos que se pueden omitir al crear un registro
interface BookingsCreationAttributes extends Optional<BookingsAttributes, "id" | "status" | "createdAt" | "updatedAt" | "deletedAt"> {}

// Se define la clase del modelo
export class Bookings extends Model<BookingsAttributes, BookingsCreationAttributes> implements BookingsAttributes {
  public id!: string;
  public customerName!: string;
  public customerEmail!: string;
  public idDestination!: number;
  public status!: boolean;
  public travelDate!: Date;
  public idCreatedByUser!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt!: Date | null;


  // Relaciones
  static associate(models: any) {
    Bookings.belongsTo(models.Destinations, { foreignKey: "idDestination", as: "destination" });
    Bookings.belongsTo(models.Users, { foreignKey: "idCreatedByUser", as: "createdByUser" });
  }
}

// Se Inicializa el modelo
export function initModel(sequelize: Sequelize) {
  Bookings.init(
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      customerName: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      customerEmail: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      idDestination: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Destinations',
            key: 'id'
        }
      },
      status: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      travelDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      idCreatedByUser: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
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
      tableName: "Bookings",
      paranoid: true, // habilita soft delete (deletedAt)
      timestamps: true, // habilita createdAt y updatedAt
    }
  );

  return Bookings;
}
