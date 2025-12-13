'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("UsersRoles", {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      idUser: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: 'Users',
              key: 'id'
          }
      },
      idRole: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: 'Roles',
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

    await queryInterface.addConstraint("UsersRoles", {
      fields: ["idUser", "idRole"],
      type: "unique",
      name: "unique_user_role" 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("UsersRoles", "unique_user_role");
    await queryInterface.dropTable("UsersRoles");
  }
};
