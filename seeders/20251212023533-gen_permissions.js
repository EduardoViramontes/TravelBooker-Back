'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tablas = await queryInterface.showAllTables();
    const noModels = ["SequelizeMeta"]
    const types = {
      'R': "READ",
      'W': "WRITE",
      'U': "UPDATE",
      'D': "DELETE",
      'S': "RESTORE",
    }
    const permisos = []
    for(const tabla of tablas){
      if(noModels.includes(tabla)) continue
      const keys = Object.keys(types)
      for(const key of keys){
        const payload = {
          model: tabla,
          descripcion: `${types[key]} ${tabla}`,
          tipo: key,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        permisos.push(payload)
      }
    }
    const [existing] = await queryInterface.sequelize.query(`
      SELECT model, tipo
      FROM "Permissions"
    `);

    const existingSet = new Set(
      existing.map(p => `${p.model}_${p.tipo}`)
    );

    const nuevosPermisos = permisos.filter(p => {
      const key = `${p.model}_${p.tipo}`;
      return !existingSet.has(key);
    });

    if (nuevosPermisos.length === 0) {
      return;
    }

    return queryInterface.bulkInsert("Permissions", nuevosPermisos, {});
  },

  async down (queryInterface, Sequelize) {}
};
