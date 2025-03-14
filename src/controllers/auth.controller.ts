import { Request, Response } from 'express';
import User from '../models/User';
import logger from '../utils/logger';

function sendLoginPage(req: Request, res: Response) {
    res.render("auth/login.html");
}

function sendRegisterPage(req: Request, res: Response) {
    res.render("auth/register.html");
}

async function registerUser(req: Request, res: Response) {
    try {
        const { username, email, password } = req.body;
        const checkUsername = await User.findOne({ where: { username: username } });
        const checkEmail = await User.findOne({ where: { email: email } });

        if (checkUsername) {
            req.flash('error', 'Username already exists');
            res.redirect('/auth/register');
            return;
        } else if (checkEmail) {
            req.flash('error', 'Email already exists');
            res.redirect('/auth/register');
            return;
        } else if (password.length < 8) {
            req.flash('error', 'Password must be at least 8 characters');
            res.redirect('/auth/register');
            return;
        }

        const newUser = await User.create({
            username: username,
            email: email,
            password: password
        });

        res.redirect("/auth/login");
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

function logoutUser(req: Request, res: Response) {
    req.logOut(function (err)  {
        if (err) {
            logger.logError(err);
        }
        res.redirect('/');
    })
}

export default { sendLoginPage, sendRegisterPage, registerUser, logoutUser };