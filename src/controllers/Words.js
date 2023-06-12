import { resolve } from 'node:path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import dotenv from 'dotenv';
import Cryptr from 'cryptr';

dotenv.config();
const cryptr = new Cryptr(process.env.CYRPTR_KEY);

const file = resolve('db.json');
const adapter = new JSONFile(file);
const defaultData = { users: [] };
const db = new Low(adapter, defaultData);

class WordsController {
  async store(req, res) {
    try {
      await db.read();
      const users = db.data.users;
      let user = null;
      for (let userI of users) {
        if (userI.id === req.userId) user = userI;
      }
      if (!user) return res.status(400).json({
        errors: ['Usuário não existe'],
      });
      let wordId = null;
      for (let wordI of user.words) {
        if (!wordI.login) wordId = wordI.id;
      }
      const { name, login } = req.body;
      const keyPass = cryptr.encrypt(req.body.keyPass);
      if (wordId) {
        let updatedWord = {};
        for (let wordI of user.words) {
          if (wordI.id === wordId) {
            wordI.name = name;
            wordI.login = login;
            wordI.keyPass = keyPass;
            updatedWord = wordI;
          }
        }
        db.write();
        return res.status(201).json(updatedWord);
      } else {
        const newWord = {
          id: Date.now().toString(),
          name,
          login,
          keyPass
        }
        user.words.push(newWord);
        db.write();
        return res.status(201).json(newWord);
      }
    } catch (e) {
      return res.status(400).json({
        errors: ['Dado não pôde ser guardado'],
      });
    }
  }

  async index(req, res) {
    try {
      await db.read();
      const users = db.data.users;
      let user = null;
      for (let userI of users) {
        if (userI.id === req.userId) user = userI;
      }
      if (!user) return res.status(400).json({
        errors: ['Usuário não existe'],
      });
      const validWords = (
        user.words
        .filter((word) => word.login !== null)
        .map((word) => {
          word.keyPass = cryptr.decrypt(word.keyPass);
          return word;
        })
      );
      return res.status(200).json(validWords);
    } catch (e) {
      return res.status(400).json({
        errors: ['Dado não pôde ser encontrado'],
      });
    }
  }

  async show(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          errors: ['Faltando ID'],
        });
      }

      await db.read();
      const users = db.data.users;
      let user = null;
      for (let userI of users) {
        if (userI.id === req.userId) user = userI;
      }
      if (!user) return res.status(400).json({
        errors: ['Usuário não existe'],
      });
      let word = null;
      for (let wordI of user.words) {
        if (wordI.id === id) word = wordI;
      }
      if (!word) {
        return res.status(400).json({
          errors: ['Informação de conta não existe'],
        });
      }
      word.keyPass = cryptr.decrypt(word.keyPass);
      return res.status(200).json(word);
    } catch (e) {
      return res.status(400).json({
        errors: ['Dado não pôde ser encontrado'],
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          errors: ['Faltando ID'],
        });
      }

      await db.read();
      const users = db.data.users;
      let user = null;
      for (let userI of users) {
        if (userI.id === req.userId) user = userI;
      }
      if (!user) return res.status(400).json({
        errors: ['Usuário não existe'],
      });

      const { name, login } = req.body;
      const keyPass = cryptr.encrypt(req.body.keyPass);

      for (let wordI of user.words) {
        if (wordI.id === id) {
          wordI.name = name;
          wordI.login = login;
          wordI.keyPass = keyPass;

          db.write();
          return res.status(200).json({
            name: wordI.name,
            login: wordI.login,
            keyPass: wordI.keyPass
          });
        }
      }

      return res.status(400).json({
        errors: ['Informação de conta não existe'],
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          errors: ['Faltando ID'],
        });
      }

      await db.read();
      const users = db.data.users;
      let user = null;
      for (let userI of users) {
        if (userI.id === req.userId) user = userI;
      }
      if (!user) return res.status(400).json({
        errors: ['Usuário não existe'],
      });

      for (let wordI of user.words) {
        if (wordI.id === id) {
          const wordDeleted = {
            id: wordI.id,
            name: wordI.name,
            login: wordI.login,
            keyPass: wordI.keyPass
          };
          wordI.name = null;
          wordI.login = null;
          wordI.keyPass = null;

          db.write();
          return res.status(200).json(wordDeleted);
        }
      }

      return res.status(400).json({
        errors: ['Informação de conta não existe'],
      });
    } catch (e) {
      return res.status(400).json({
        errors: e.errors.map((err) => err.message),
      });
    }
  }
}

export default new WordsController();
