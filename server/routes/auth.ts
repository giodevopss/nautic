import { Router } from "express";
import { prisma } from "../db";
import { hashPassword, verifyPassword } from "../lib/password";
import { issueSessionToken, verifySessionToken } from "../lib/token";

const router = Router();

const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/vip-lead", async (req, res) => {
  const { email } = req.body ?? {};
  const em = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!em || !emailRx.test(em)) {
    res.status(400).json({ error: "Informe um e-mail válido." });
    return;
  }
  try {
    await prisma.vipLead.upsert({
      where: { email: em },
      create: { email: em },
      update: {},
    });
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Não foi possível salvar. Tente de novo." });
  }
});

function stripCustomer(c: {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return { id: c.id, name: c.name, email: c.email, phone: c.phone };
}

router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body ?? {};
  const n = typeof name === "string" ? name.trim() : "";
  const em = typeof email === "string" ? email.trim().toLowerCase() : "";
  const ph = typeof phone === "string" ? phone.trim() : "";
  const pw = typeof password === "string" ? password : "";

  if (!n || !em || !ph) {
    res.status(400).json({ error: "Preencha nome, e-mail e telefone." });
    return;
  }
  if (pw.length < 8) {
    res.status(400).json({ error: "A senha deve ter pelo menos 8 caracteres." });
    return;
  }

  try {
    const existing = await prisma.customer.findUnique({ where: { email: em } });
    if (existing?.passwordHash) {
      res.status(409).json({ error: "Este e-mail já possui cadastro. Faça login." });
      return;
    }

    const passwordHash = hashPassword(pw);
    let customer;
    if (existing) {
      customer = await prisma.customer.update({
        where: { id: existing.id },
        data: { name: n, phone: ph, passwordHash },
      });
    } else {
      customer = await prisma.customer.create({
        data: { name: n, email: em, phone: ph, passwordHash },
      });
    }

    const token = issueSessionToken(customer.id);
    res.status(201).json({ token, customer: stripCustomer(customer) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Não foi possível concluir o cadastro." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const em = typeof email === "string" ? email.trim().toLowerCase() : "";
  const pw = typeof password === "string" ? password : "";

  if (!em || !pw) {
    res.status(400).json({ error: "E-mail e senha são obrigatórios." });
    return;
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { email: em } });
    if (!customer?.passwordHash) {
      res.status(400).json({
        error: "Conta sem senha. Cadastre-se ou use a reserva online.",
      });
      return;
    }
    if (!verifyPassword(pw, customer.passwordHash)) {
      res.status(401).json({ error: "E-mail ou senha incorretos." });
      return;
    }

    const token = issueSessionToken(customer.id);
    res.json({ token, customer: stripCustomer(customer) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Falha ao entrar." });
  }
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  if (!token) {
    res.status(401).json({ error: "Não autenticado." });
    return;
  }
  const v = verifySessionToken(token);
  if (!v) {
    res.status(401).json({ error: "Sessão inválida ou expirada." });
    return;
  }
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: v.sub },
      select: { id: true, name: true, email: true, phone: true },
    });
    if (!customer) {
      res.status(401).json({ error: "Usuário não encontrado." });
      return;
    }
    res.json({ customer });
  } catch {
    res.status(500).json({ error: "Erro ao carregar perfil." });
  }
});

export default router;
