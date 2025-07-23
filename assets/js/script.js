// Firebase Auth & Firestore setup
const auth = firebase.auth();
const db = firebase.firestore();

// Register
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection('users').doc(userCredential.user.uid).set({
        email: email,
        plan: 'free'
      });
      alert('Registration successful!');
      window.location.href = 'dashboard.html';
    } catch (err) {
      alert(err.message);
    }
  });
}

// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = 'dashboard.html';
    } catch (err) {
      alert('Login failed: ' + err.message);
    }
  });
}

// Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
      window.location.href = 'login.html';
    } catch (err) {
      alert('Error logging out: ' + err.message);
    }
  });
}

// Auth State Change: Feature Lock by Plan
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const plan = userData.plan || 'free';

    // Plan-based display with upgrade banners
document.querySelectorAll('[data-plan]').forEach((el) => {
  const allowedPlans = el.getAttribute('data-plan').split(',');
  if (!allowedPlans.includes(plan)) {
    const banner = document.createElement('div');
    banner.classList.add('upgrade-banner');
    banner.innerHTML = `🚫 This feature requires a <strong>${allowedPlans.join(' or ')}</strong> plan. <a href="pricing.html">Upgrade Now</a>`;
    el.innerHTML = '';
    el.appendChild(banner);
  }
});
    // Load dashboard trips
    const userTrips = document.getElementById('userTrips');
    if (userTrips) {
      const snapshot = await db.collection('trips')
        .where('userId', '==', user.uid)
        .get();

      userTrips.innerHTML = snapshot.empty
        ? '<p>No trips saved yet.</p>'
        : Array.from(snapshot.docs).map(doc => {
            const trip = doc.data();
            return `<div class="trip-card">
              <h3>${trip.title}</h3>
              <p>${trip.description}</p>
              <small>🗓️ ${trip.date}</small>
            </div>`;
          }).join('');
    }
  } catch (err) {
    console.error('Error loading user plan/trips:', err);
  }
});
