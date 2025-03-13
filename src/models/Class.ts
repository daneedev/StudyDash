import { db } from '../db';
import { Model, DataTypes } from 'sequelize';
import crypto from 'crypto';
import Exam from './Exam';
class Class extends Model {
    declare id: number;
    declare name: string;
    declare inviteCode: string;


    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

}

Class.init({
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    inviteCode: {
        type: DataTypes.STRING(128),
        allowNull: false,
        unique: true,
        defaultValue: () => crypto.randomBytes(8).toString('hex')
    }

   
}, {
    tableName: 'classes',
    sequelize: db,
});

Class.hasMany(Exam, { foreignKey: "classId", as: "exams" });

Class.sync()

export default Class;