'use strict';
module.exports = function(sequelize, DataTypes) {
  var Venue = sequelize.define('Venue', {
    yelpId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    viewcount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Venue.hasMany(models.Comment, {foreignKey: 'businessId'});
      }
    }
  });
  return Venue;
};