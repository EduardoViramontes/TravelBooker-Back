'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const roles = {
      "ADMIN": [
        {"Bookings": ['R', 'W', 'U', 'D', 'S']}, 
        {"Destinations": ['R', 'W', 'U', 'D', 'S']},
        {"Permissions": ['R', 'W', 'U', 'D', 'S']},
        {"RolesPermissions": ['R', 'W', 'U', 'D', 'S']}, 
        {"Roles": ['R', 'W', 'U', 'D', 'S']},  
        {"Users": ['R', 'W', 'U', 'D', 'S']},
        {"UsersRoles": ['R', 'W', 'U', 'D', 'S']}, 
      ],
      "AGENT": [
        {"Bookings": ['R', 'W', 'U', 'D', 'S']}, 
        {"Destinations": ['R','W', 'U',]},
      ],
      "VIEWER": [
        {"Bookings": ['R']}, 
        {"Destinations": ['R']},
      ],
    }
    const [existing] = await queryInterface.sequelize.query(`
      SELECT name
      FROM "Roles"
    `);
    const existingSet = existing.map(p => `${p.name}`);
    const keys = Object.keys(roles)
    for(const key of keys){
      if(!existingSet.includes(key)){
        const rolPermissions = roles[key]
        const payloadRol = {
          name: key,
          descripcion: `MANAGE ROL ${key}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        const [rol] = await queryInterface.bulkInsert("Roles",[payloadRol],{ returning: true });
        for(const rolPermission of rolPermissions){
          const model = Object.keys(rolPermission)[0]
          const typePermissions = rolPermission[model]
          for(const typePermission of typePermissions){
            const [permiso] = await queryInterface.sequelize.query(`SELECT * FROM "Permissions" WHERE tipo = :tipo AND model = :model`,{
                replacements: {
                  model: model,
                  tipo: typePermission,
                },
                type: queryInterface.sequelize.QueryTypes.SELECT,
              }
            );
            if(permiso != null){
              const payloadRol = {
                idRole: rol.id,
                idPermission: permiso.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
              await queryInterface.bulkInsert("RolesPermissions",[payloadRol]);
            }
          }
        }
      }
    }
  },

  async down (queryInterface, Sequelize) {}
};
