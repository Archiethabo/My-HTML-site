// ---------- Firebase Auth Setup ----------
const auth = firebase.auth();
const db = firebase.firestore();

// ---------- REGISTER USER ----------
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      // Save default plan to Firestore (free by default)
      await db.collection('users').doc(userId).set({
        email: email,
        plan: 'free'
      });

      alert('Registration successful!');
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert(error.message);
    }
  });
}

// ---------- LOGIN USER ----------
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  });
}

// ---------- LOGOUT USER ----------
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
      alert('Logged out!');
      window.location.href = 'login.html';
    } catch (error) {
      console.error(error.message);
    }
  });
}

// ---------- DASHBOARD PLAN CHECK + FEATURE ACCESS ----------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    if (window.location.pathname.includes('dashboard.html')) {
      window.location.href = 'login.html';
    }
    return;
  }

  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const plan = userData.plan || 'free';

    // Show/hide content based on data-plan
    document.querySelectorAll('[data-plan]').forEach((el) => {
      const allowedPlan = el.getAttribute('data-plan');
      const plansAllowed = {
        free: ['free'],
        pro: ['free', 'pro'],
        premium: ['free', 'pro', 'premium']
      };
      if (!plansAllowed[plan].includes(allowedPlan)) {
        el.style.display = 'none';
      } else {
        el.style.display = 'block';
      }
    });

    // ---------- LOAD TRIPS ON DASHBOARD ----------
    const userTrips = document.getElementById('userTrips');
    if (userTrips) {
      const snapshot = await db.collection('trips')
        .where('userId', '==', user.uid)
        .get();

      if (snapshot.empty) {
        userTrips.innerHTML = '<p>No trips saved yet.</p>';
      } else {
        userTrips.innerHTML = '';
        snapshot.forEach(doc => {
          const trip = doc.data();
          userTrips.innerHTML += `
            <div class="trip-card">
              <h3>${trip.title}</h3>
              <p>${trip.description}</p>
              <small>🗓️ ${trip.date}</small>
            </div>
          `;
        });
      }
    }
  } catch (err) {
    console.error('Failed to load user plan or trips:', err);
  }
});

// ---------- AI CHAT PLANNER ----------
const aiForm = document.getElementById('aiForm');
const aiResult = document.getElementById('aiResult');
if (aiForm && aiResult) {
  aiForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = document.getElementById('aiPrompt').value;
    aiResult.textContent = 'Thinking...';

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk-your-key-here', // Replace with your actual key
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      aiResult.textContent = data.choices[0].message.content;
    } catch (err) {
      aiResult.textContent = 'Failed to get response. Try again.';
      console.error(err);
    }

    aiForm.reset();
  });
}
