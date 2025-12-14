import { DataTypes, Model } from 'sequelize';
import db from '../utils/db';

class ClassUserModel extends Model {
  declare id: number;
  declare userId: number;
  declare classId: number;
  declare role: 'admin' | 'member';
  declare createdAt: Date;
  declare updatedAt: Date;
}

ClassUserModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    classId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'member'),
      allowNull: false,
      defaultValue: 'member',
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
    tableName: 'class_users',
    sequelize: db.sequelize,
    modelName: 'ClassUser',
  },
);

ClassUserModel.sync();

export default ClassUserModel;
