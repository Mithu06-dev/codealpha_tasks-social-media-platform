const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'social.db'));

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDb() {
  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      bio TEXT DEFAULT 'A friendly member of Social Hub.',
      followers INTEGER DEFAULT 0,
      following INTEGER DEFAULT 0
    )`
  );

  await run(
    `CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      time TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )`
  );

  const defaultUser = await get('SELECT id FROM users WHERE username = ?', ['Alice']);
  if (!defaultUser) {
    const hashedPassword = bcrypt.hashSync('password', 10);
    const insertUser = await run(
      'INSERT INTO users (username, password, bio, followers, following) VALUES (?, ?, ?, ?, ?)',
      ['Alice', hashedPassword, 'Welcome to the Social Hub demo account.', 124, 88]
    );

    await run(
      'INSERT INTO posts (user_id, content, time, likes) VALUES (?, ?, ?, ?)',
      [insertUser.lastID, 'Welcome to our new social media platform! Share a post now.', new Date().toLocaleString(), 3]
    );
  }
}

initDb().catch((err) => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

app.use(express.json());
app.use(
  session({
    secret: 'social-secret-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/auth', (req, res) => {
  res.json({ loggedIn: !!req.session.userId, username: req.session.username || null });
});

app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const result = await run(
      'INSERT INTO users (username, password, bio, followers, following) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, 'A friendly member of Social Hub.', 0, 0]
    );
    req.session.userId = result.lastID;
    req.session.username = username;
    res.json({ username });
  } catch (error) {
    if (error.message.includes('UNIQUE') || error.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Username already exists.' });
    }
    res.status(500).json({ error: 'Unable to create account.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = await get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid username or password.' });
  }

  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ username: user.username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in.' });
  }

  const user = await get('SELECT username, bio, followers, following FROM users WHERE id = ?', [req.session.userId]);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json(user);
});

app.get('/api/posts', async (req, res) => {
  const rows = await all(
    `SELECT p.id, u.username, p.content, p.time, p.likes
     FROM posts p
     JOIN users u ON p.user_id = u.id
     ORDER BY p.id DESC`
  );
  res.json(rows);
});

app.post('/api/posts', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to post.' });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Post content is required.' });
  }

  const result = await run(
    'INSERT INTO posts (user_id, content, time, likes) VALUES (?, ?, ?, ?)',
    [req.session.userId, content, new Date().toLocaleString(), 0]
  );

  res.status(201).json({ id: result.lastID, user: req.session.username, content, time: new Date().toLocaleString(), likes: 0 });
});

app.post('/api/posts/:id/like', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to like posts.' });
  }

  const postId = Number(req.params.id);
  await run('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);

  const post = await get(
    `SELECT p.id, u.username, p.content, p.time, p.likes
     FROM posts p
     JOIN users u ON p.user_id = u.id
     WHERE p.id = ?`,
    [postId]
  );

  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }
  res.json(post);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
