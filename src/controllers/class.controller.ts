import {Request, Response} from 'express';
import Class from '../models/Class';
import ClassUser from '../models/ClassUser';
import User from '../models/User';

function createClass(req: Request, res: Response) {
    const { name } = req.body;
    const user = req.user as User;
    Class.create({ name: name}).then((classInstance) => {
        ClassUser.create({ classId: classInstance.id, userId: user.id, role: 'admin' });
    })
    res.status(200).json({ message: 'Class created' });
}

async function deleteClass(req: Request, res: Response) {
    const { id } = req.body;
    const user = req.user as User;
    const classuser = await ClassUser.findOne({ where: { classId: id, userId: user.id } });
    if (!classuser || classuser.role !== 'admin') {
        res.status(403).json({ message: 'User not authorized' });
        return
    }

    Class.destroy({ where: { id: id } });
    ClassUser.destroy({ where: { classId: id } });
    res.status(200).json({ message: 'Class deleted' });
}

async function joinClass(req: Request, res: Response) {
    const { inviteCode } = req.body;
    const user = req.user as User;

    const classInstance = await Class.findOne({ where: { inviteCode: inviteCode } });
    if (!classInstance) {
        res.status(404).json({ message: 'Class does not exist' });
        return
    }

    const existingEntry = await ClassUser.findOne({ where: { classId: classInstance.id, userId: user.id } });
    if (existingEntry) {
        res.status(400).json({ message: 'User already in class' });
        return
    }

    await ClassUser.create({ classId: classInstance.id, userId: user.id, role: 'student' });
    res.status(200).json({ message: 'User joined class' });
}

async function leaveClass(req: Request, res: Response) {
    const { id } = req.body;
    const user = req.user as User;
    const classAdmins = await ClassUser.findAll({ where: { classId: id, role: 'admin' } });
    if (classAdmins.length === 1 && classAdmins[0].userId === user.id) {
        res.status(400).json({ message: 'Cannot leave class with only one admin' });
        return
    }

    ClassUser.destroy({ where: { classId: id, userId: user.id } });
    res.status(200).json({ message: 'User left class' });
}

async function getClassPage(req: Request, res: Response) {
    const { id } = req.params;
    const classInstance = await Class.findOne({ where: { id: id } });
    if (!classInstance) {
        res.status(404).json({ message: 'Class does not exist' });
        return
    }
    const classMembers = await ClassUser.findAll({ where: { classId: id } });
    res.render('class.html', { classId: id, classMembers: classMembers });
}

export default { createClass, deleteClass, joinClass, leaveClass, getClassPage };