import express from 'express';
import assignmentController from '../controllers/assignment.controller';
import { checkAuth } from "../utils/checkAuth";
import isInClass  from "../utils/isInClass"

const router = express.Router();

router.post('/create/', checkAuth, isInClass, assignmentController.createAssignment);

router.get('/:id', checkAuth, isInClass, assignmentController.getClassAssignments);

router.put('/update/:id', checkAuth, assignmentController.updateAssignment);

router.delete('/delete/:id', checkAuth, assignmentController.deleteAssignment);

export default router; 