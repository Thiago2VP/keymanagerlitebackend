import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import homeRoutes from './routes/home.js';
import userRoutes from './routes/user.js';
import tokenRoutes from './routes/token.js';
import wordsRoutes from './routes/words.js';
import apiKeyRoutes from './routes/apiKey.js';

dotenv.config();

const whiteList = [process.env.FRONT_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

class App {
  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
  }
  
  middlewares() {
    this.app.use(cors(corsOptions));
    this.app.use(helmet());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(express.json());
  }
  
  routes() {
    this.app.use('/', homeRoutes);
    this.app.use('/users', userRoutes);
    this.app.use('/tokens', tokenRoutes);
    this.app.use('/words', wordsRoutes);
    this.app.use('/apikey', apiKeyRoutes);
  }
}

export default new App().app;
