import type { Request, Response, NextFunction } from "express";

const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "owner") {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
  next();
};

export default adminMiddleware;
