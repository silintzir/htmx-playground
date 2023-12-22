import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path';
import { URL } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;

const app = express();

app.use(express.json());
app.use(morgan('tiny'));
app.use(helmet());

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (_, res) => {
  res.render('index');
});

app.listen(3000, () => {
  console.log('Listening on 3000');
});
