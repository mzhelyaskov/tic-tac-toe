'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.createTable('User', {
          id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER
          },
          username: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true
          },
          created_at: {
              allowNull: false,
              type: Sequelize.DATE
          },
          updated_at: {
              allowNull: false,
              type: Sequelize.DATE
          }
      });
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable('User');
  }
};
