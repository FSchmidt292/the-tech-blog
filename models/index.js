const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/connection');
// create the user model

class User extends Model {
    // set up method to run on instance data (per user) to check password
    checkPassword(loginPw) {
        return bcrypt.compareSync(loginPw, this.password);
    }
}

// define table columns and configuration

// create fields/columns for User model
User.init(
    {
    //table column definitions go here.
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
//define a username column
      username: {
        type: DataTypes.STRING,
        allowNull: false
      },
//define an email column
      email: {
        type: DataTypes.STRING,
//there cannot be any duplicate email values in this table        
        allowNull: false,
        unique: true,
// if allowNull is set to false, we can run our data through validators before creating the table data
        validate: {
          isEmail: true
        }
      },
    //define a password column
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
    // this means the password must be at least 4 characters long
          len: [4]
        }
      }
    },
    {
      hooks: {
        // set up beforeCreate lifecycle "hook" functionality
        async beforeCreate(newUserData) {
          newUserData.password = await bcrypt.hash(newUserData.password, 10);
          return newUserData;
        },
    // set up before update lifecycle "hook" functionality
        async beforeUpdate(updatedUserData) {
          updatedUserData.password = await bcrypt.hash(updatedUserData.password, 10);
          return updatedUserData;
        }
      },
      //TABLE CONFIGURATIONS OPTIONS GO HERE (https:// sequelize.org/v5/manual/models-definition.html#configuration)

    //pass in our imported sequelize connection (the direct connection to our database)
      sequelize,
      //don't automatically create createdAt/updatedAt timestamp fields
      timestamps: false,
      //don't pluralize name of database table
      freezeTableName: true,
      // use underscores instead of came-casing(i.e. 'comment_text and not 'commentText'.)
      underscored: true,
      //make it so our model name stays lowercase in the database
      modelName: 'user'
    }
  );

module.exports = User;