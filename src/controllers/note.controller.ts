import { Request, Response } from 'express';
import Note from '../models/Note';
import User from '../models/User';

async function uploadNote(req: Request, res: Response) {
    const { title, description, subject, classId } = req.body;
    const user = req.user as User;
    const filePath = req.file?.path;

    try {
        const note = await Note.create({
            title: title,
            description: description,
            classId: classId,
            addedBy: user.id,
            filePath: filePath,
            subject: subject
        })

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error uploading note' });
    }
}

async function getNotes(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const notes = await Note.findAll({
            where: { classId: id },
        });

        res.status(200).json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notes' });
    }
}

async function updateNote(req: Request, res: Response) {
    const { id } = req.params;
    const { title, description, subject, classId } = req.body;

    try {
        const note = await Note.findByPk(id);
        if (!note) {
            res.status(404).json({ message: 'Note not found' });
            return;
        }

        note.title = title;
        note.description = description;
        note.classId = classId;
        note.subject = subject;
        await note.save();

        res.status(200).json(note);
    } catch (error) {
        res.status(500).json({ message: 'Error updating note' });
    }
}

async function deleteNote(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const note = await Note.findByPk(id);
        if (!note) {
           res.status(404).json({ message: 'Note not found' });
           return;
        }

        await note.destroy();
        res.status(200).json({ message: 'Note deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting note' });
    }
}

export default {
    uploadNote,
    getNotes,
    updateNote,
    deleteNote
}