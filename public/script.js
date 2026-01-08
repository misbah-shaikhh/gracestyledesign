// Input elements
const nameInput = document.getElementById("name");
const contactNoInput = document.getElementById("contactNo");
const emailInput = document.getElementById("email");
const dobInput = document.getElementById("dob");
const genderInput = document.getElementById("gender");
const loginEmailInput = document.getElementById("loginEmail");

// Validation functions
function isValidName(name) {
  return /^[A-Za-z ]+$/.test(name);
}

function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(phone);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidDate(date) {
  return !isNaN(new Date(date).getTime());
}

// REGISTER
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const contactNo = contactNoInput.value.trim();
  const email = emailInput.value.trim();
  const dob = dobInput.value;
  const gender = genderInput.value;

  if (!isValidName(name)) {
    alert("Invalid name");
    return;
  }

  if (!isValidPhone(contactNo)) {
    alert("Invalid phone number");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Invalid email");
    return;
  }

  if (!isValidDate(dob)) {
    alert("Invalid DOB");
    return;
  }

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contactNo, email, dob, gender })
    });

    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert("Registration failed");
  }
});

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = loginEmailInput.value.trim();

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    alert(data.message);
  } catch (err) {
    alert("Login failed");
  }
});
