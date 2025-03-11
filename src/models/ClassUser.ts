import { db } from '../db';
import { Model, DataTypes } from 'sequelize';
import User from './User';
import Class from './Class';

class ClassUser extends Model {
    declare classId: number;
    declare userId: number;
    declare role: 'admin' | 'student';
}

ClassUser.init({
    classId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Class,
            key: 'id'
        }
    },
    userId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'student'),
        allowNull: false,
        defaultValue: 'student'
    }
}, {
    tableName: 'class_users',
    sequelize: db
});
Class.belongsToMany(User, { through: ClassUser, foreignKey: 'classId' });
User.belongsToMany(Class, { through: ClassUser, foreignKey: 'userId' });

export default ClassUser;
