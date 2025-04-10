import { Model, DataTypes } from 'sequelize';
import { db } from '../db';
import Class from './Class';
import User from './User';

class Assignment extends Model {
    declare id: number;
    declare title: string;
    declare description: string;
    declare dueDate: Date;
    declare classId: number;
    declare type: 'exam' | 'homework';
    declare status: 'upcoming' | 'completed' | 'cancelled';
    declare addedBy: number;
    declare Class?: Class;
    declare User?: User;
}

Assignment.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    classId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Class,
            key: 'id'
        }
    },
    type: {
        type: DataTypes.ENUM('exam', 'homework'),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('upcoming', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'upcoming'
    },
    addedBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    tableName: 'assignments',
    sequelize: db
});

Assignment.sync();

export default Assignment; 