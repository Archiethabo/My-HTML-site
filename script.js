// Firebase config (Replace with your actual Firebase config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// =================== LOGIN ===================
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = "dashboard.html";
    } catch (err) {
      alert("Login failed: " + err.message);
    }
  });

  document.getElementById('forgotPassword').addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt("Enter your email to reset password:");
    if (email) {
      try {
        await auth.sendPasswordResetEmail(email);
        alert("Password reset email sent!");
      } catch (err) {
        alert(err.message);
      }
    }
  });
}

// =================== REGISTER ===================
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = registerForm.email.value;
    const password = registerForm.password.value;

    try {
      await auth.createUserWithEmailAndPassword(email, password);
      alert("Account created!");
      window.location.href = "dashboard.html";
    } catch (err) {
      alert("Registration error: " + err.message);
    }
  });
}

// =================== DASHBOARD ===================
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  });
}

// =================== AI Chat (OpenAI API) ===================
const chatForm = document.getElementById('chatForm');
if (chatForm) {
  const chatBox = document.getElementById('chatBox');

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const prompt = chatForm.prompt.value;
    displayMessage("You", prompt);
    chatForm.prompt.value = "";

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer YOUR_OPENAI_API_KEY"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const reply = data.choices[0].message.content;
      displayMessage("AI", reply);
    } catch (err) {
      displayMessage("Error", "Something went wrong.");
    }
  });

  function displayMessage(sender, text) {
    const msg = document.createElement("div");
    msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatBox.appendChild(msg);
  }
}
