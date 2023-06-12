import { resolve } from 'node:path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcryptjs';

const file = resolve('db.json');
const adapter = new JSONFile(file);
const defaultData = { users: [] };
const db = new Low(adapter, defaultData);

class UserController {
  async store(req, res) {
    try {
      await db.read();
      const users = db.data.users;
      for (let user of users) {
        if (user.email === req.body.email) return res.status(401).json({
          errors: ['Email já cadastrado']
        })
      }
      const hashPassword = await bcrypt.hash(req.body.password, 8);
      const newUser = {
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
        words: []
      };
      db.data.users.push(newUser);
      db.write();
      const { id, name, email } = newUser;
      return res.status(201).json({ id, name, email });
    } catch (e) {
      return res.status(400).json({
        errors: e,
      });
    }
  }

  async update(req, res) {
    try {
      await db.read();
      const users = db.data.users;
      let user = null;
      for (let userI of users) {
        if (userI.id === req.userId) user = userI;
      }
      if (!user) return res.status(400).json({ errors: ["Usuário não existe"] });
      const hashPassword = await bcrypt.hash(req.body.password, 8);
      user.name = req.body.name
      user.email = req.body.email;
      user.password = hashPassword;
      db.write();
      const { id, name, email } = user;
      return res.status(200).json({ id, name, email });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async delete(req, res) {
    try {
      await db.read();
      const users = db.data.users;
      let user = null;
      for (let userI of users) {
        if (userI.id === req.userId) user = userI;
      }
      if (!user) return res.status(400).json({ errors: ["Usuário não existe"] });
      const { id, name, email } = user;
      user.name = null
      user.email = null;
      user.password = null;
      user.words = null;
      db.write();
      return res.status(200).json({ id, name, email });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async passwordIsValid(email, password) {
    try {
      await db.read();
      const users = db.data.users;
      let user = null;
      for (let userI of users) {
        if (userI.email === email) user = userI;
      }
      if (!user) return false;
      return bcrypt.compare(password, user.password);
    } catch (e) {
      return false;
    }
  }
}

export default new UserController();
