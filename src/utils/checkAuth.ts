import { Request, Response, NextFunction } from "express";

function checkAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/auth/login");
}

function checkNotAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return res.redirect("/dash");
  }
  next();
}

export { checkAuth, checkNotAuth };