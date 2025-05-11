import { Model, DataTypes } from 'sequelize';
import { db } from '../db';
class Assignment extends Model {
    declare id: number;
    declare title: string;
    declare subject: string;
    declare description: string;
    declare dueDate: Date;
    declare classId: number;
    declare type: 'exam' | 'homework';
    declare status: 'upcoming' | 'completed' | 'cancelled';
    declare addedBy: number;
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
    subject: { 
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
    }
}, {
    tableName: 'assignments',
    sequelize: db
});

Assignment.sync();

export default Assignment; 