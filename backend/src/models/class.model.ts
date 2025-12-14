import { DataTypes, Model } from 'sequelize';
import db from '../utils/db';

class ClassModel extends Model {
  declare id: number;
  declare name: string;
  declare inviteCode: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

ClassModel.init(
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
    inviteCode: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
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
    tableName: 'classes',
    sequelize: db.sequelize,
    modelName: 'Class',
  },
);

ClassModel.sync();

export default ClassModel;