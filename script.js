// Firebase config — replace with your own Moblue project config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "Moblue.firebaseapp.com",
  projectId: "Moblue",
  storageBucket: "Moblue.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- AUTH ---
// Login function
async function login(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

// Logout function
function logout() {
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
}

// Register function (optional)
async function register(email, password) {
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert('Registration failed: ' + error.message);
  }
}

// Monitor auth state
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User logged in:', user.email);
    // Load user data on dashboard
    if (window.location.pathname.endsWith('dashboard.html')) {
      loadUserTrips(user.uid);
      document.getElementById('userEmail').textContent = user.email;
    }
  } else {
    console.log('No user logged in');
    if (window.location.pathname.endsWith('dashboard.html')) {
      window.location.href = 'login.html';
    }
  }
});

// --- DATA ---
// Load user trips from Firestore
function loadUserTrips(uid) {
  const tripList = document.getElementById('tripList');
  tripList.innerHTML = '<li>Loading trips...</li>';

  db.collection('users').doc(uid).collection('trips')
    .get()
    .then(snapshot => {
      tripList.innerHTML = '';
      if (snapshot.empty) {
        tripList.innerHTML = '<li>No trips planned yet.</li>';
        return;
      }
      snapshot.forEach(doc => {
        const trip = doc.data();
        const li = document.createElement('li');
        li.textContent = `${trip.destination} — ${trip.date}`;
        tripList.appendChild(li);
      });
    })
    .catch(error => {
      tripList.innerHTML = '<li>Error loading trips.</li>';
      console.error('Error fetching trips:', error);
    });
}

// --- CONTACT FORM ---
const contactForm = document.querySelector('.contact-form');
if(contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back shortly.');
    contactForm.reset();
  });
}

// --- AI CHAT (optional basic stub) ---
const aiInput = document.querySelector('.ai-box input');
const aiButton = document.querySelector('.ai-box button');
if(aiButton && aiInput) {
  aiButton.addEventListener('click', () => {
    const question = aiInput.value.trim();
    if(!question) {
      alert('Please type your question.');
      return;
    }
    // Here you would call your backend API or OpenAI API to get response
    alert('AI response feature coming soon!\nYou asked: ' + question);
    aiInput.value = '';
  });
}

// --- LOGOUT BUTTON ---
const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn) {
  logoutBtn.addEventListener('click', e => {
    e.preventDefault();
    logout();
  });
}
