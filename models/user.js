var userUtils = require('../utils/userUtils');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User',
        {
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    len: [2],
                    is: /^[a-z0-9]+$/i
                }
            }
        },
        {
            freezeTableName: true,
            underscored: true,
            classMethods: {
                authorize: function(username, callback) {
                    User.findOrCreate({where: {username: username}})
                        .spread(function (user, created) {
                            callback(null, user);
                        });
                }
            }
        }
    );
    return User;
};