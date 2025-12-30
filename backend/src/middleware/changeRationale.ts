import { Request, Response, NextFunction } from 'express';

export interface ChangeRationaleRequest extends Request {
  rationale?: string;
}

export const requireChangeRationale = (req: ChangeRationaleRequest, res: Response, next: NextFunction) => {
  const { rationale } = req.body;

  if (!rationale || typeof rationale !== 'string' || rationale.trim().length === 0) {
    return res.status(400).json({
      error: 'Change rationale is required',
      message: 'Please provide a rationale explaining why this change is being made',
    });
  }

  req.rationale = rationale.trim();
  next();
};
