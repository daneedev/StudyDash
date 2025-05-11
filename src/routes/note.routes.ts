import express from 'express';
import { checkAuth } from "../utils/checkAuth";
import isInClass  from "../utils/isInClass"
import multer from 'multer';
import { upload } from '../utils/upload';
import noteController from '../controllers/note.controller';

const router = express.Router();

router.post('/upload/', checkAuth, isInClass, upload.single('file'), noteController.uploadNote);

router.get('/:id', checkAuth, isInClass, noteController.getNotes);

router.put('/update/:id', checkAuth, noteController.updateNote);

router.delete('/delete/:id', checkAuth, noteController.deleteNote);

export default router; 