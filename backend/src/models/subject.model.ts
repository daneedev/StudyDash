import { DataTypes, Model } from 'sequelize';
import db from '../utils/db';

class SubjectModel extends Model {
  declare id: number;
  declare name: string;
  declare classId: number;
  declare createdAt: Date;
  declare updatedAt: Date;
}

SubjectModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    classId: {
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
    tableName: 'subjects',
    sequelize: db.sequelize,
    modelName: 'Subject',
  },
);

SubjectModel.sync();

export default SubjectModel;
