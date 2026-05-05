import type { RequestHandler } from "express";

export const requireAdmin: RequestHandler = (req, res, next) => {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) {
    res.status(503).json({
      error: "Painel administrativo desativado: defina ADMIN_SECRET no ambiente da API.",
    });
    return;
  }
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (token !== secret) {
    res.status(401).json({ error: "Não autorizado." });
    return;
  }
  next();
};
