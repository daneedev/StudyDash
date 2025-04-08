import express, { Request, Response } from 'express';
import passport from 'passport';
const router = express.Router();
import { checkAuth, checkNotAuth } from '../utils/checkAuth';
import authController from '../controllers/auth.controller';

router.get("/login", checkNotAuth, authController.sendLoginPage)

router.post("/login", checkNotAuth, passport.authenticate('local', {
    successRedirect: '/dash',
    failureRedirect: '/auth/login',
    failureFlash: true
}))

router.get("/register", checkNotAuth, authController.sendRegisterPage)

router.post("/register", checkNotAuth, authController.registerUser);

router.get("/logout", checkAuth, authController.logoutUser);


export default router;