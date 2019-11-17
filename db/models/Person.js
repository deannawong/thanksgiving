const Sequelize = require("sequelize");
const { db } = require("../connection");

const Person = db.define("person", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    notEmpty: true
  },
  isAttending: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    notEmpty: true
  }
});

module.exports = { Person };
