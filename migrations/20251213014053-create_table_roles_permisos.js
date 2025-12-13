'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("RolesPermissions", {
      id: {
        autoIncrement: true,
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      idRole: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: 'Roles',
              key: 'id'
          }
      },
      idPermission: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
              model: 'Permissions',
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

    await queryInterface.addConstraint("RolesPermissions", {
      fields: ["idRole", "idPermission"],
      type: "unique",
      name: "unique_role_permission" 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint("RolesPermissions", "unique_role_permission");
    await queryInterface.dropTable("RolesPermissions");
  }
};
