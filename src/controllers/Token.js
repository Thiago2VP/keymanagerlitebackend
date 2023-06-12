import { resolve } from 'node:path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import jwt from 'jsonwebtoken';

import User from '../controllers/User.js';

const file = resolve('db.json');
const adapter = new JSONFile(file);
const defaultData = { users: [] };
const db = new Low(adapter, defaultData);

class TokenController {
  async store(req, res) {
    const { email = "", password = "" } = req.body;

    if (!email || !password) {
      return res.status(401).json({ errors: ["Credenciais inválidas."] });
    }

    await db.read();
    const users = db.data.users;

    let user = null;
    for (let userI of users) {
      if (userI.email === email) user = userI;
    }

    if (!user) {
      return res.status(401).json({ errors: ["Usuário não existe."] });
    }

    if (!(await User.passwordIsValid(email, password))) {
      return res.status(401).json({ errors: ["Senha inválida."] });
    }

    const { id } = user;
    const token = jwt.sign({ id, email }, process.env.TOKEN_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRATION,
    });

    return res.status(200).json({ token, user: { name: user.name, id, email } });
  }
}

export default new TokenController();
