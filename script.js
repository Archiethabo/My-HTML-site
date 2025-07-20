// ---------- REGISTER USER ----------
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    try {
      await auth.createUserWithEmailAndPassword(email, password);
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

// ---------- LOAD TRIPS ON DASHBOARD ----------
const userTrips = document.getElementById('userTrips');
if (userTrips) {
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const snapshot = await db.collection('trips').where('userId', '==', user.uid).get();
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
    } else {
      window.location.href = 'login.html';
    }
  });
}

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
          'Authorization': 'Bearer sk-your-key-here',
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
