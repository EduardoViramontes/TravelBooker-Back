'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const users = [
      {
        payload: {
          name: "ADMIN",
          email: "admin@test.com",
          password: "$2b$10$2r5EcntvMlO0wjlVCi65U.lmw1zGi8ci9z1m8hsoUs9Ln5ZfPC9zq",
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          
        },
        rol: "ADMIN",
      },
      {
         payload: {
          name: "AGENT",
          email: "agent@test.com",
          password: "$2b$10$2r5EcntvMlO0wjlVCi65U.lmw1zGi8ci9z1m8hsoUs9Ln5ZfPC9zq",
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
         },
         rol: "AGENT",
      },
      {
        payload:{
          name: "VIEWER",
          email: "viwer@test.com",
          password: "$2b$10$2r5EcntvMlO0wjlVCi65U.lmw1zGi8ci9z1m8hsoUs9Ln5ZfPC9zq",
          status: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        rol: "VIEWER",
      }
    ]
    for(const payloadUser of users){
      const [user] = await queryInterface.bulkInsert("Users", [payloadUser.payload], { returning: true });
      
      const [rol] = await queryInterface.sequelize.query(`SELECT * FROM "Roles" WHERE name = :name`,{
          replacements: {
            name: payloadUser.rol,
          },
          type: queryInterface.sequelize.QueryTypes.SELECT,
        }
      );

      if(rol != null){
        const payloadUserRol = {
          idUser: user.id,
          idRole: rol.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await queryInterface.bulkInsert("UsersRoles",[payloadUserRol]);
      }
    }
     
    return null
  },

  async down (queryInterface, Sequelize) {}
};
