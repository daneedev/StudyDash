import  User from './User';
import Class from './Class';
import ClassUser from './ClassUser';

User.belongsToMany(Class, { through: ClassUser, foreignKey: 'userId' });
Class.belongsToMany(User, { through: ClassUser, foreignKey: 'classId' });

ClassUser.belongsTo(User, { foreignKey: 'userId' });
ClassUser.belongsTo(Class, { foreignKey: 'classId' });

User.hasMany(ClassUser, { foreignKey: 'userId' });
Class.hasMany(ClassUser, { foreignKey: 'classId' });
