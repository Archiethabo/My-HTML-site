// Firebase Auth & Firestore
const auth = firebase.auth();
const db = firebase.firestore();

// REGISTER
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

// LOGIN
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

// LOGOUT
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

// AUTH & PLAN ENFORCEMENT
auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    const userData = userDoc.data();
    const plan = userData.plan || 'free';

    // Show plan banner
    const planBanner = document.getElementById('userPlanBanner');
    if (planBanner) {
      planBanner.textContent = `👤 Your Current Plan: ${plan.toUpperCase()}`;
    }

    // Feature restriction UI
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

    // If all data-plan features hidden, show global notice
    const visibleFeatures = Array.from(document.querySelectorAll('[data-plan]'))
      .filter(el => el.style.display !== 'none');
    if (visibleFeatures.length === 0) {
      const upgradeNotice = document.getElementById('upgradeNotice');
      if (upgradeNotice) upgradeNotice.style.display = 'block';
    }

    // Load saved trips on dashboard
    const userTrips = document.getElementById('userTrips');
    if (userTrips) {
      const snapshot = await db.collection('trips').where('userId', '==', user.uid).get();
      userTrips.innerHTML = snapshot.empty
        ? '<p>No trips saved yet.</p>'
        : snapshot.docs.map(doc => {
            const trip = doc.data();
            return `<div class="trip-card">
              <h3>${trip.title}</h3>
              <p>${trip.description}</p>
              <small>🗓️ ${trip.date}</small>
            </div>`;
          }).join('');
    }

    // AI Planner Logic (only Pro or Premium can generate and save)
    const aiForm = document.getElementById('aiForm');
    if (aiForm) {
      const aiPrompt = document.getElementById('aiPrompt');
      const aiResult = document.getElementById('aiResult');

      aiForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!['pro', 'premium'].includes(plan)) {
          aiResult.innerHTML = `<div class="upgrade-banner">
            🚫 AI Planner requires a Pro or Premium plan. <a href="pricing.html">Upgrade Now</a>
          </div>`;
          return;
        }

        const prompt = aiPrompt.value;
        aiResult.innerHTML = '⏳ Generating itinerary...';

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer YOUR_OPENAI_API_KEY' // Replace this
            },
            body: JSON.stringify({
              model: 'gpt-4',
              messages: [{ role: 'user', content: prompt }],
              max_tokens: 500
            })
          });

          const data = await response.json();
          const aiText = data.choices?.[0]?.message?.content || 'No response.';
          aiResult.innerHTML = `<div class="result-box">${aiText}</div>`;

          // Save result to Firestore
          await db.collection('trips').add({
            userId: user.uid,
            title: `AI Plan: ${prompt}`,
            description: aiText,
            date: new Date().toISOString()
          });
        } catch (err) {
          aiResult.innerHTML = `<p class="error">❌ Failed to generate plan: ${err.message}</p>`;
        }
      });
    }

  } catch (err) {
    console.error('Auth error:', err);
  }
});
