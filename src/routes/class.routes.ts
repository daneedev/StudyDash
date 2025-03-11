import express, { Request, Response } from 'express';
const router = express.Router();
import { checkAuth, checkNotAuth } from '../utils/checkAuth';
import classController from '../controllers/class.controller';

router.post("/create", checkAuth, classController.createClass);

router.post("/delete", checkAuth, classController.deleteClass);

router.post("/join", checkAuth, classController.joinClass);

router.post("/leave", checkAuth, classController.leaveClass);

export default router;