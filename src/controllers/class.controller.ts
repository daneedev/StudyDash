import {Request, Response} from 'express';
import Class from '../models/Class';
import ClassUser from '../models/ClassUser';
import User from '../models/User';

function createClass(req: Request, res: Response) {
    const { name } = req.body;
    const user = req.user as User;
    Class.create({ name, inviteLink: Math.random().toString(36).substring(7) }).then((classInstance) => {
        ClassUser.create({ classId: classInstance.id, userId: user.id, role: 'admin' });
    })
    res.status(200).json({ message: 'Class created' });
}

async function deleteClass(req: Request, res: Response) {
    const { classId } = req.body;
    const user = req.user as User;
    const classuser = await ClassUser.findOne({ where: { classId, userId: user.id } });
    if (!classuser || classuser.role !== 'admin') {
        res.status(403).json({ message: 'User not authorized' });
        return
    }

    Class.destroy({ where: { id: classId } });
    res.status(200).json({ message: 'Class deleted' });
}

async function joinClass(req: Request, res: Response) {
    const { inviteLink, userId } = req.body;

    const classInstance = await Class.findOne({ where: { inviteLink } });
    if (!classInstance) {
        res.status(404).json({ message: 'Class does not exist' });
        return
    }

    const existingEntry = await ClassUser.findOne({ where: { classId: classInstance.id, userId: userId } });
    if (existingEntry) {
        res.status(400).json({ message: 'User already in class' });
        return
    }

    await ClassUser.create({ classId: classInstance.id, userId, role: 'student' });
    res.status(200).json({ message: 'User joined class' });
}

function leaveClass(req: Request, res: Response) {
    const { classId, userId } = req.body;

    ClassUser.destroy({ where: { classId, userId } });
    res.status(200).json({ message: 'User left class' });
}

export default { createClass, deleteClass, joinClass, leaveClass };