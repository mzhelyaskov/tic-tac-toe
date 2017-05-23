'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.createTable('Session', {
          sid: {
              type: Sequelize.STRING,
              primaryKey: true
          },
          userId: Sequelize.STRING,
          expires: Sequelize.DATE,
          data: Sequelize.TEXT,
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
      return queryInterface.dropTable('Session');
  }
};
