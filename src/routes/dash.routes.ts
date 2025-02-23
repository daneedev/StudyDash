import express from 'express';
import { checkAuth } from '../utils/checkAuth';
const router = express.Router();

router.get("/", checkAuth, (req, res) => {
    res.render("dash.html", { user: req.user });
});

export default router;