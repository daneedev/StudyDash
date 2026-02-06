import { DataTypes, Model } from 'sequelize';
import db from '../utils/db';

class AssignmentModel extends Model {
  declare id: number;
  declare name: string;
  declare subject: string;
  declare description: string;
  declare dueDate: Date;
  declare classId: number;
  declare type: 'homework' | 'exam';
  declare addedBy: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

AssignmentModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: false,
    },
    subject: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    classId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('homework', 'exam'),
      allowNull: false,
    },
    addedBy: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'assignments',
    sequelize: db.sequelize,
    modelName: 'Assignment',
  },
);

AssignmentModel.sync();

export default AssignmentModel;