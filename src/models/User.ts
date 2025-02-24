import { db } from '../db';
import { Model, DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

class User extends Model {
    declare id: number;
    declare username: string;
    declare email: string;
    declare password: string;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

}

User.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    password: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
}, {
    tableName: 'users',
    sequelize: db,
});

User.beforeCreate(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
})

User.sync()

export default User;