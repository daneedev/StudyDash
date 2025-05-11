import {Request, Response} from 'express';
import Class from '../models/Class';
import ClassUser from '../models/ClassUser';
import User from '../models/User';
import Assignment from '../models/Assignment';
import Note from '../models/Note';

function createClass(req: Request, res: Response) {
    const { name } = req.body;
    const user = req.user as User;
    Class.create({ name: name}).then((classInstance) => {
        ClassUser.create({ classId: classInstance.id, userId: user.id, role: 'admin' });
    })
    res.redirect('/dash');
}

async function deleteClass(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as User;
    const classuser = await ClassUser.findOne({ where: { classId: id, userId: user.id } });
    if (!classuser || classuser.role !== 'admin') {
        res.status(403).json({ message: 'User not authorized' });
        return
    }

    Class.destroy({ where: { id: id } });
    ClassUser.destroy({ where: { classId: id } });
    res.redirect('/dash');
}

async function joinClass(req: Request, res: Response) {
    const { inviteCode } = req.body;
    const user = req.user as User;

    const classInstance = await Class.findOne({ where: { inviteCode: inviteCode } });
    if (!classInstance) {
        res.redirect('/dash');
        return
    }

    const existingEntry = await ClassUser.findOne({ where: { classId: classInstance.id, userId: user.id } });
    if (existingEntry) {
        res.redirect('/dash');
        return
    }

    await ClassUser.create({ classId: classInstance.id, userId: user.id, role: 'student' });
    res.redirect('/dash');
}

async function leaveClass(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as User;
    const classAdmins = await ClassUser.findAll({ where: { classId: id, role: 'admin' } });
    if (classAdmins.length === 1 && classAdmins[0].userId === user.id) {
        res.status(400).json({ message: 'Cannot leave class with only one admin' });
        return
    }

    ClassUser.destroy({ where: { classId: id, userId: user.id } });
    res.redirect('/dash');
}

async function getClassPage(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as User;
    const classInstance = await Class.findOne({ where: { id: id } });
    if (!classInstance) {
        res.status(404).json({ message: 'Class does not exist' });
        return
    }
    const classMembers = await ClassUser.findAll({ where: { classId: id }, include: [{
        model: User,
        as: 'User',
    }] });
    const date = new Date();
    const currentDate = {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear()
    }

    const exams = await Assignment.findAll({ where: { type: 'exam' } });
    const notes = await Note.findAll({ where: { classId: id } });
    const homeworks = await Assignment.findAll({ where: { classId: id, type: 'homework' } });

    const userRole = (await ClassUser.findOne({ where: { classId: id, userId: user.id } }))?.role;

    res.render('class.html', { class: classInstance, users: classMembers, user: req.user, currentDate: currentDate, exams: exams, notes: notes, homeworks: homeworks, userRole: userRole });
}

export default { createClass, deleteClass, joinClass, leaveClass, getClassPage };