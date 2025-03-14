import {NextFunction, Request, Response } from 'express';
import ClassUser from '../models/ClassUser';
import User from '../models/User';

async function isInClass(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const user = req.user as User;

    await ClassUser.findOne({ where: { classId: id, userId: user.id } }).then((classuser) => {
        if (!classuser) {
            res.redirect('/dash');
            return
        }
        next();
    })
}

export default isInClass;