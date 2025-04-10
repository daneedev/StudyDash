import { Model, DataTypes } from 'sequelize';
import { db } from '../db';
import Class from './Class';

class Exam extends Model {
    declare id: number;
    declare name: string;
    declare classId: number;
    declare subject: string;
    declare date: Date;
}

Exam.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    classId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    },
    subject: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    addedBy: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
    }
}, {
    tableName: 'exams',
    sequelize: db
});

Exam.sync();



export default Exam;
