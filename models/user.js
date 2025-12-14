export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    googleId: {
      type: DataTypes.STRING,
      allowNull: true, // This field will only be populated for OAuth users
    },
  });

  return User;
};