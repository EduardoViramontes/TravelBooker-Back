'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("Bookings", {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      customerName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      customerEmail: {
        type: Sequelize.STRING(150),
        allowNull: false,
      },
      idDestination: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Destinations',
            key: 'id'
        }
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      travelDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      idCreatedByUser: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE(3),
        allowNull: false,
        defaultValue: new Date(),
      },
      updatedAt: {
        type: Sequelize.DATE(3),
        allowNull: false,
        defaultValue: new Date(),
      },
      deletedAt: {
        type: Sequelize.DATE(3),
        allowNull: true,
        defaultValue: null,
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("Bookings");
  }
};
