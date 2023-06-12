import jwt from 'jsonwebtoken';
import { resolve } from 'node:path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

const file = resolve('db.json');
const adapter = new JSONFile(file);
const defaultData = { users: [] };
const db = new Low(adapter, defaultData);

export default async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({
      errors: ["É necessário estar logado."],
    });
  }

  const [, token] = authorization.split(" ");

  try {
    const data = jwt.verify(token, process.env.TOKEN_SECRET);
    const { id, email } = data;

    await db.read();
    const users = db.data.users;

    let user = null;
    for (let userI of users) {
      if (userI.id === id && userI.email === email) user = userI;
    }

    if (!user) {
      return res.status(401).json({
        errors: ["Usuário inválido"],
      });
    }

    req.userId = id;
    req.userEmail = email;
    return next();
  } catch (e) {
    return res.status(401).json({
        errors: ["Token expirado ou inválido"],
    });
  }
}
