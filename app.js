const profileName = document.getElementById('profileName');
const profileBio = document.getElementById('profileBio');
const followersCount = document.getElementById('followersCount');
const followingCount = document.getElementById('followingCount');
const feedContainer = document.getElementById('feedContainer');
const postForm = document.getElementById('postForm');
const contentInput = document.getElementById('contentInput');
const authPanel = document.getElementById('authPanel');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');
const postCreator = document.getElementById('postCreator');
const logoutButton = document.getElementById('logoutButton');

let isLoggedIn = false;

function setAuthMessage(text, isError = true) {
  authMessage.textContent = text;
  authMessage.style.color = isError ? '#b91c1c' : '#16a34a';
}

async function fetchAuth() {
  const response = await fetch('/api/auth', { credentials: 'same-origin' });
  return response.json();
}

async function fetchProfile() {
  const response = await fetch('/api/profile', { credentials: 'same-origin' });
  if (!response.ok) {
    setAuthMessage('Please log in to refresh your profile.');
    return;
  }
  const profile = await response.json();
  profileName.textContent = profile.username;
  profileBio.textContent = profile.bio;
  followersCount.textContent = profile.followers;
  followingCount.textContent = profile.following;
}

async function fetchPosts() {
  const response = await fetch('/api/posts', { credentials: 'same-origin' });
  const posts = await response.json();
  renderPosts(posts);
}

function renderPosts(posts) {
  feedContainer.innerHTML = '';
  if (posts.length === 0) {
    feedContainer.innerHTML = '<p class="empty-state">No posts yet. Create one when you log in.</p>';
    return;
  }

  posts.forEach((post) => {
    const card = document.createElement('article');
    card.className = 'post-card';

    const header = document.createElement('div');
    header.className = 'post-header';
    header.innerHTML = `<strong>${escapeHtml(post.username)}</strong><time>${escapeHtml(post.time)}</time>`;

    const content = document.createElement('p');
    content.className = 'post-content';
    content.textContent = post.content;

    const actions = document.createElement('div');
    actions.className = 'post-actions';

    const likeButton = document.createElement('button');
    likeButton.className = 'like-button';
    likeButton.textContent = isLoggedIn ? 'Like' : 'Login to like';
    likeButton.disabled = !isLoggedIn;
    likeButton.addEventListener('click', () => likePost(post.id));

    const likeCount = document.createElement('span');
    likeCount.className = 'like-count';
    likeCount.textContent = `${post.likes} like${post.likes === 1 ? '' : 's'}`;

    actions.appendChild(likeButton);
    actions.appendChild(likeCount);

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(actions);
    feedContainer.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function likePost(postId) {
  const response = await fetch(`/api/posts/${postId}/like`, {
    method: 'POST',
    credentials: 'same-origin'
  });
  if (response.ok) {
    fetchPosts();
  } else {
    const error = await response.json();
    setAuthMessage(error.error || 'Unable to like post.');
  }
}

postForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const content = contentInput.value.trim();
  if (!content) return;

  const response = await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ content })
  });

  if (response.ok) {
    contentInput.value = '';
    fetchPosts();
    fetchProfile();
  } else {
    const error = await response.json();
    setAuthMessage(error.error || 'Could not post.');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!username || !password) return;

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (response.ok) {
    setAuthMessage('Logged in successfully!', false);
    loadApp();
  } else {
    setAuthMessage(data.error || 'Login failed.');
  }
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  if (!username || !password) return;

  const response = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (response.ok) {
    setAuthMessage('Account created! You are now logged in.', false);
    loadApp();
  } else {
    setAuthMessage(data.error || 'Signup failed.');
  }
});

logoutButton.addEventListener('click', async () => {
  await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' });
  loadApp();
});

async function loadApp() {
  const auth = await fetchAuth();
  isLoggedIn = auth.loggedIn;

  if (isLoggedIn) {
    authPanel.classList.add('hidden');
    postCreator.classList.remove('hidden');
    setAuthMessage('');
    await fetchProfile();
    await fetchPosts();
  } else {
    authPanel.classList.remove('hidden');
    postCreator.classList.add('hidden');
    setAuthMessage('You must log in or sign up to post and like content.', false);
    await fetchPosts();
  }
}

loadApp();
