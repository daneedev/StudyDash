import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import ClassUser from '../models/ClassUser';
import User from '../models/User';

async function createAssignment(req: Request, res: Response) {
    const { title, description, dueDate, id, type, subject } = req.body;
    const user = req.user as User;

    try {
        await Assignment.create({
            title: title,
            description: description,
            subject: subject,
            status: 'upcoming',
            dueDate : dueDate,
            classId: id,
            type: type,
            addedBy: user.id
        });

       res.redirect(`/class/${id}`);
    } catch (error) {
        res.status(500).json({ message: 'Error creating assignment' });
    }
}

async function getClassAssignments(req: Request, res: Response) {
    const { classId } = req.params;
    const user = req.user as User;

    const classUser = await ClassUser.findOne({ 
        where: { 
            classId: classId, 
            userId: user.id 
        } 
    });

    if (!classUser) {
        res.status(403).json({ message: 'Not authorized to view assignments for this class' });
        return;
    }

    try {
        const assignments = await Assignment.findAll({
            where: { classId: classId },
            include: [
                {
                    model: User,
                    as: 'User',
                    attributes: ['id', 'username']
                }
            ],
            order: [['dueDate', 'ASC']]
        });

        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching assignments' });
    }
}

async function updateAssignment(req: Request, res: Response) {
    const { id } = req.params;
    const updates = req.body;
    const user = req.user as User;

    try {
        const assignment = await Assignment.findOne({ where: { id: id } });
        
        if (!assignment) {
            res.status(404).json({ message: 'Assignment not found' });
            return;
        }

        const classUser = await ClassUser.findOne({ 
            where: { 
                classId: assignment.classId, 
                userId: user.id,
                role: 'admin'
            } 
        });

        if (!classUser) {
            res.status(403).json({ message: 'Not authorized to update this assignment' });
            return;
        }

        await assignment.update(updates);
        res.status(200).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Error updating assignment' });
    }
}

async function deleteAssignment(req: Request, res: Response) {
    const { id } = req.params;
    const user = req.user as User;

    try {
        const assignment = await Assignment.findOne({ where: { id: id } });
        
        if (!assignment) {
            res.status(404).json({ message: 'Assignment not found' });
            return;
        }

        const classUser = await ClassUser.findOne({ 
            where: { 
                classId: assignment.classId, 
                userId: user.id,
                role: 'admin'
            } 
        });

        if (!classUser) {
            res.status(403).json({ message: 'Not authorized to delete this assignment' });
            return;
        }

        await assignment.destroy();
        res.redirect(`/class/${assignment.classId}`);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting assignment' });
    }
}

export default {
    createAssignment,
    getClassAssignments,
    updateAssignment,
    deleteAssignment
}; 