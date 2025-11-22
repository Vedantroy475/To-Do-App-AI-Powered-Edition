// api/index.js
import functions from '@google-cloud/functions-framework';
import express from 'express';
import path from 'path';
import 'dotenv/config';

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------- health check ----------
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ---------- Register API handlers under /api prefix ----------
// Note: we *mount* the handlers under /api so we don't need rewrite hacks.
// This matches your frontend fetches (/api/...)
import addTodoHandler from './addTodo.js';
import aiChatHandler from './aiChat.js';
import changePasswordHandler from './change-password.js';
import deleteAccountHandler from './delete-account.js';
import deleteTodoHandler from './deleteTodo.js';
import getTodosHandler from './getTodos.js';
import loginHandler from './login.js';
import logoutHandler from './logout.js';
import meHandler from './me.js';
import signupHandler from './signup.js';
import updateTodoHandler from './updateTodo.js';

const router = express.Router();

router.post('/addTodo', addTodoHandler);
router.post('/aiChat', aiChatHandler);
router.post('/change-password', changePasswordHandler);
router.post('/delete-account', deleteAccountHandler);
router.delete('/deleteTodo/:id', deleteTodoHandler);
router.get('/getTodos', getTodosHandler);
router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.get('/me', meHandler);
router.post('/signup', signupHandler);
router.put('/updateTodo', updateTodoHandler);

// Mount router under /api
app.use('/api', router);

// ---------- Serve static frontend (production build) ----------
const staticDir = path.join(process.cwd(), 'dist');
// Serve static files if they exist
app.use(express.static(staticDir));

// SPA fallback — only for GETs that are not for /api and don't look like file requests
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();

  // If it starts with /api -> let router handle it (should already have matched)
  if (req.path.startsWith('/api/')) return next();

  // If the request looks like a file (has a dot in last segment), let static middleware handle it
  const lastSegment = req.path.split('/').pop() || '';
  if (lastSegment.includes('.')) return next();

  // otherwise send index.html
  const indexFile = path.join(staticDir, 'index.html');
  return res.sendFile(indexFile, (err) => {
    if (err) next(err);
  });
});

// catch-all 404 for anything else
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Register with Functions Framework for Cloud Run
functions.http('api', app);
