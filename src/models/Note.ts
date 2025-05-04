import { Model, DataTypes } from 'sequelize';
import { db } from '../db';
import Class from './Class';
import User from './User';

class Note extends Model {
    declare id: number;
    declare title: string;
    declare subject: string;
    declare description: string;
    declare classId: number;
    declare addedBy: number;
    declare Class?: Class;
    declare User?: User;
}

Note.init({
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
    classId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: Class,
            key: 'id'
        }
    },
    addedBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    filePath: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
}, {
    tableName: 'notes',
    sequelize: db
});

Note.sync();

export default Note; 