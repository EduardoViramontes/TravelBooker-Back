'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const destinations = [
      {
        name: "HOLLYWOD",
        country: "ESTADOS UNIDOS DE AMERICA",
        city: "LOS ANGELES",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "GDL TURIBUS",
        country: "MÉXICO",
        city: "GUADALARAJA",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "PTO. VALLARTA LANCHAS",
        country: "MÉXICO",
        city: "PTO. VALLARTA",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "PTO. VALLARTA BARCOS",
        country: "MÉXICO",
        city: "PTO. VALLARTA",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "MAZAMITLA CABALLOS",
        country: "MÉXICO",
        city: "MAZAMITLA",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for(const destination of destinations){
      const [destinSaved] = await queryInterface.sequelize.query(`SELECT * FROM "Destinations" WHERE name = :name AND country = :country AND city = :city`,{
          replacements: {
            name: destination.name,
            country: destination.country,
            city: destination.city,
          },
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );
      if(destinSaved == null){
        await queryInterface.bulkInsert("Destinations",[destination]);
      }
    }
  },

  async down (queryInterface, Sequelize) {}
};
