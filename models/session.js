module.exports = function (sequelize, DataTypes) {
    return sequelize.define('Session', {
        sid: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        userId: DataTypes.STRING,
        expires: DataTypes.DATE,
        data: DataTypes.TEXT
    }, {
        freezeTableName: true,
        underscored: true,
        classMethods: {
            associate: function (models) {
                // associations can be defined here
            }
        }
    });
};