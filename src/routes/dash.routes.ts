import express from 'express';
import { checkAuth } from '../utils/checkAuth';
import Class from '../models/Class';
import ClassUser from '../models/ClassUser';
import User from '../models/User';
const router = express.Router();

router.get("/", checkAuth, async (req, res) => {
    const user = req.user as User;
    const joinedClassUsers = await ClassUser.findAll({
        where: { userId: user.id, role: 'student' }
    })
    
    const joinedClasses = await Class.findAll({
        where: { id: joinedClassUsers.map((classUser) => classUser.classId),  }
    });

    const createdClassUsers = await ClassUser.findAll({
        where: { userId: user.id, role: 'admin' }
    })
    const createdClasses = await Class.findAll({
        where: { id: createdClassUsers.map((classUser) => classUser.classId),  }
    });
        
    res.render("dashboard.html", { user: req.user, joinedClasses: joinedClasses, createdClasses: createdClasses });
});

export default router;