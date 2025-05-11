import express, { Request, Response } from 'express';
const router = express.Router();
import { checkAuth, checkNotAuth } from '../utils/checkAuth';
import isInClass from '../utils/isInClass';
import classController from '../controllers/class.controller';

router.get("/:id", checkAuth, isInClass, classController.getClassPage);

router.post("/create", checkAuth, classController.createClass);

router.post("/delete/:id", checkAuth, classController.deleteClass);

router.post("/join", checkAuth, classController.joinClass);

router.post("/leave/:id", checkAuth, classController.leaveClass);

export default router;