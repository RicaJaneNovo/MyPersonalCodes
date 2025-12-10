// ELEMENT SHORTCUTS
const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const dashboard = document.getElementById('dashboard');
const settingsPanel = document.getElementById('settingsPanel');

const loginEmail = document.getElementById('loginEmail');
const loginPass = document.getElementById('loginPass');
const loginMsg = document.getElementById('loginMsg');

const signupName = document.getElementById('signupName');
const signupEmail = document.getElementById('signupEmail');
const signupPass = document.getElementById('signupPass');
const signupMsg = document.getElementById('signupMsg');

const ownerName = document.getElementById('ownerName');

const fillBar = document.getElementById('fillBar');
const contactBtn = document.getElementById('contactBtn');
const statusMessage = document.getElementById('statusMessage');

const activityList = document.getElementById('activityList');

const reviews = document.getElementById('reviews'); // not used but kept for compatibility
const ratingSelect = document.getElementById('rating');
const comment = document.getElementById('comment');

let currentFill = 0;      // percent (0-100)
let activityLog = [];     // store recent activity

// ----------------------- AUTH FLOW -----------------------
function showSignup(){
  loginCard.classList.add('d-none');
  signupCard.classList.remove('d-none');
  loginMsg.innerText='';
  signupMsg.innerText='';
}
function showLogin(){
  signupCard.classList.add('d-none');
  loginCard.classList.remove('d-none');
  signupMsg.innerText='';
  loginMsg.innerText='';
}

function signup(){
  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const pass = signupPass.value;

  if(!name || !email || !pass){
    signupMsg.style.color='crimson';
    signupMsg.innerText='Please fill all fields.';
    return;
  }

  // Simple user object storage (only one account for demo). Replace with array/db as needed.
  const user = { name, email, pass };
  localStorage.setItem('smartbin_user', JSON.stringify(user));

  signupMsg.style.color='green';
  signupMsg.innerText='Account created. Returning to login...';

  setTimeout(() => {
    showLogin();
    signupName.value = signupEmail.value = signupPass.value = '';
  }, 900);
}

function login(){
  const email = loginEmail.value.trim();
  const pass = loginPass.value;

  const raw = localStorage.getItem('smartbin_user');
  if(!raw){
    loginMsg.style.color='crimson';
    loginMsg.innerText = 'No account found. Please sign up first.';
    return;
  }
  const user = JSON.parse(raw);

  if(email === user.email && pass === user.pass){
    // show dashboard
    document.querySelector('main').scrollTop = 0;
    document.getElementById('authWrap').style.display='none';
    dashboard.classList.remove('d-none');

    ownerName.innerText = user.name || 'User';

    // populate profile fields in settings
    document.getElementById('profileFullname').value = user.name || '';
    document.getElementById('profileEmail').value = user.email || '';
    document.getElementById('profilePassword').value = user.pass || '';

    // initialize dashboard counters + load logs
    startCounters();
    loadActivity();
  } else {
    loginMsg.style.color='crimson';
    loginMsg.innerText = 'Incorrect email or password.';
  }
}

function logout(){
  // hide settings if open
  settingsPanel.classList.add('d-none');

  // show auth again
  document.getElementById('authWrap').style.display='flex';
  dashboard.classList.add('d-none');
  loginEmail.value=''; loginPass.value='';
}

// delete account (danger)
function deleteAccount(){
  if(confirm('Delete your account permanently?')){
    localStorage.removeItem('smartbin_user');
    alert('Account deleted.');
    logout();
  }
}

// ----------------------- SETTINGS NAV -----------------------
function toggleSettings(){
  settingsPanel.classList.toggle('d-none');
}

// settings subpage nav
document.querySelectorAll('.settings-item').forEach(item => {
  item.addEventListener('click', () => {
    const target = item.getAttribute('data-open');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    const el = document.getElementById(target);
    if(el) el.classList.add('active-page');
  });
});

document.querySelectorAll('.sub-back').forEach(b => {
  b.addEventListener('click', () => {
    const target = b.getAttribute('data-target');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
    document.getElementById(target).classList.add('active-page');
  });
});

// ----------------------- SMART BIN LOGIC -----------------------
function setFill(percent){
  currentFill = Math.max(0, Math.min(100, percent));
  fillBar.style.width = currentFill + '%';
  fillBar.innerText = Math.round(currentFill) + '%';
  if(currentFill >= 100){
    statusMessage.innerText = 'Bin is full!';
    contactBtn.disabled = false;
  } else {
    statusMessage.innerText = '';
    contactBtn.disabled = true;
  }
}

function addWaste(){
  const amount = Number(document.getElementById('amount').value);
  const type = document.getElementById('wasteType').value;

  if(!amount || amount <= 0){
    statusMessage.style.color = 'crimson';
    statusMessage.innerText = 'Enter a valid amount.';
    return;
  }

  // For demo, map liters to percent with 1L = 1% (adjust as needed).
  const delta = amount;
  setFill(currentFill + delta);

  addActivity(`${amount}L of ${type} added`, true);
  document.getElementById('amount').value = '';
  statusMessage.style.color = '#333';
  statusMessage.innerText = `Added ${amount}L of ${type}.`;
}

function simulateAdd(n){
  setFill(currentFill + n);
  addActivity(`${n}L quick add`, true);
}

// contact collector
function contactCollector(){
  addActivity('Collector contacted for pickup', true);
  alert('A garbage collector has been notified!');
  contactBtn.disabled = true;
}

// ----------------------- ACTIVITY LOG -----------------------
function addActivity(text, toTop = false){
  const t = new Date();
  const item = { text, time: t.toLocaleString() };
  if(toTop) activityLog.unshift(item); else activityLog.push(item);
  // keep only recent 20
  activityLog = activityLog.slice(0, 20);
  localStorage.setItem('smartbin_activity', JSON.stringify(activityLog));
  renderActivity();
}

function loadActivity(){
  const raw = localStorage.getItem('smartbin_activity');
  activityLog = raw ? JSON.parse(raw) : [
    { text: 'Welcome to Smart Bin — your dashboard is ready!', time: new Date().toLocaleString() }
  ];
  renderActivity();
}

function renderActivity(){
  activityList.innerHTML = '';
  activityLog.forEach(a => {
    const li = document.createElement('li');
    li.innerHTML = `<div>${a.text}</div><div class="activity-time">${a.time}</div>`;
    activityList.appendChild(li);
  });
}

// ----------------------- REVIEWS -----------------------
function addReview(){
  const rating = Number(ratingSelect.value);
  const text = (comment.value || '').trim();

  // store in localStorage (array)
  const raw = localStorage.getItem('smartbin_reviews');
  const arr = raw ? JSON.parse(raw) : [];
  arr.unshift({ rating, text, time: new Date().toLocaleString() });
  localStorage.setItem('smartbin_reviews', JSON.stringify(arr));

  // update rating summary
  updateRatings();
  addActivity(`New review: ${'★'.repeat(rating)} ${text ? '- ' + text : ''}`, true);
  comment.value = '';
  alert('Thanks for your review!');
}

// rating summary
function updateRatings(){
  const raw = localStorage.getItem('smartbin_reviews');
  const arr = raw ? JSON.parse(raw) : [];
  const count = arr.length;
  document.getElementById('ratingCount').innerText = count;

  if(count === 0){
    document.getElementById('avgRating').innerText = '0.0';
    return;
  }
  const avg = arr.reduce((s, r) => s + r.rating, 0) / count;
  document.getElementById('avgRating').innerText = avg.toFixed(1);
}

// ----------------------- ANIMATED COUNTERS -----------------------
function animateCount(el, target, duration = 900){
  const start = 0;
  const range = target - start;
  let startTime = null;
  function step(ts){
    if(!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    el.innerText = Math.round(start + range * progress);
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function startCounters(){
  animateCount(document.getElementById('stat1'), Number(document.getElementById('stat1').dataset.target || 128));
  animateCount(document.getElementById('stat2'), Number(document.getElementById('stat2').dataset.target || 42));
  animateCount(document.getElementById('stat3'), Number(document.getElementById('stat3').dataset.target || 87));
  updateRatings();
}

// small helper to load user if already logged (optional)
function autoLoginIfUserExists(){
  const raw = localStorage.getItem('smartbin_user');
  if(raw){
    // show login screen but prefill email
    const u = JSON.parse(raw);
    loginEmail.value = u.email || '';
  }
}

// initialize
autoLoginIfUserExists();
loadActivity();
updateRatings();
setFill(0);
