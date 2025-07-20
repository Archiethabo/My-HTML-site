
// Firebase Registration
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    try {
      await firebase.auth().createUserWithEmailAndPassword(email, password);
      alert('Registered successfully!');
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert(error.message);
    }
  });
}

// Firebase Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      alert('Login successful!');
      window.location.href = 'dashboard.html';
    } catch (error) {
      alert(error.message);
    }
  });
}
