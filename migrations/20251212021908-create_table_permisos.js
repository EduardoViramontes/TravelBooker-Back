'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("Permissions", {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      model: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tipo: {
          type: Sequelize.ENUM('R', 'W', 'U', 'D', 'S'),
          allowNull: false,
          defaultValue: 'R',
          comment: 'R => Read, W => Write, U => Update, D => Delete, S => Restore. Default "R"'
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
    await queryInterface.dropTable("Permissions");
  }
};
