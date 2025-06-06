const API = 'https://teamcontrolapp.onrender.com';
let currentUser = null;
let isAdmin = false;

function showLogin() {
  document.getElementById('title').innerText = 'Login';
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  // Ensure event listeners are set every time
  document.getElementById('login-username').onkeydown = function(e) {
    if (e.key === 'Enter') login();
  };
  document.getElementById('login-password').onkeydown = function(e) {
    if (e.key === 'Enter') login();
  };
}

function showRegister() {
  document.getElementById('title').innerText = 'Register';
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
  // Ensure event listeners are set every time
  document.getElementById('register-username').onkeydown = function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      register();
    }
  };
  document.getElementById('register-password').onkeydown = function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      register();
    }
  };
}

function showDashboard() {
  document.getElementById('title').innerText = 'Dashboard';
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  document.getElementById('welcome').innerText = `Welcome, ${currentUser}${isAdmin ? ' (Admin)' : ''}`;
  document.getElementById('user-form').style.display = isAdmin ? 'none' : 'block';
  // Set records label for admin or user
  document.getElementById('records-label').innerText = isAdmin ? 'All Team Records' : 'Your Records';
  loadRecords();
}

async function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const msg = document.getElementById('login-msg');
  msg.innerText = '';
  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = username;
      isAdmin = data.isAdmin;
      showDashboard();
    } else {
      msg.innerText = data.message || 'Login failed';
    }
  } catch (e) { msg.innerText = 'Network error'; }
}

async function register() {
  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  const msg = document.getElementById('register-msg');
  msg.innerText = '';
  try {
    const res = await fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      msg.innerText = 'Registered! Please login.';
    } else {
      msg.innerText = data.message || 'Register failed';
    }
  } catch (e) { msg.innerText = 'Network error'; }
}

async function submitData() {
  const location = document.getElementById('location').value.trim();
  const time = document.getElementById('time').value.trim();
  const work = document.getElementById('work').value.trim();
  const msg = document.getElementById('dashboard-msg');
  msg.innerText = '';
  if (!location || !time || !work) {
    msg.innerText = 'Please fill all fields.';
    return;
  }
  try {
    const res = await fetch(API + '/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser, location, time, work })
    });
    const data = await res.json();
    if (data.success) {
      msg.innerText = 'Submitted!';
      document.getElementById('location').value = '';
      document.getElementById('time').value = '';
      document.getElementById('work').value = '';
      loadRecords();
    } else {
      msg.innerText = data.message || 'Failed to submit';
    }
  } catch (e) { msg.innerText = 'Network error'; }
}

async function loadRecords() {
  const tbody = document.querySelector('#records-table tbody');
  tbody.innerHTML = '';
  try {
    const res = await fetch(API + `/records?username=${encodeURIComponent(currentUser)}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      for (const r of data) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.username}</td><td>${r.location}</td><td>${r.time}</td><td>${r.work}</td>`;
        tbody.appendChild(tr);
      }
    }
  } catch (e) { tbody.innerHTML = '<tr><td colspan="4">Network error</td></tr>'; }
}

function logout() {
  currentUser = null;
  isAdmin = false;
  showLogin();
}

// Expose functions to global scope
window.login = login;
window.register = register;
window.submitData = submitData;
window.showRegister = showRegister;
window.showLogin = showLogin;
window.logout = logout;

showLogin();
