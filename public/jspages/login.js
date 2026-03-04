 /* 
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

// ================= REGISTER =================
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const contactNo = document.getElementById("contactNo").value.trim();
  const email = document.getElementById("email").value.trim();
  const dob = document.getElementById("dob").value;
  const gender = document.getElementById("gender").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

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

  if (password.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await fetch("/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        contactNo,
        email,
        dob,
        gender,
        password
      }),
    });

    const data = await res.json();
    alert(data.message);
  } catch (err) {
    console.error(err);
    alert("Registration failed");
  }
});


// ================= LOGIN =================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    alert(data.message);
  } catch (err) {
    console.error(err);
    alert("Login failed");
  }
}); */

/* ---------------- TIMER VARIABLES (GLOBAL) ---------------- */

let countdown;
let timeLeft = 30;

/* ---------------- TIMER FUNCTION (GLOBAL) ---------------- */

function startTimer() {

    const timerDisplay = document.getElementById("timer");
    const resendBtn = document.getElementById("resendBtn");

    timeLeft = 30;
    timerDisplay.textContent = timeLeft;

    resendBtn.style.pointerEvents = "none";
    resendBtn.style.opacity = "0.5";

    clearInterval(countdown);

    countdown = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            resendBtn.style.pointerEvents = "auto";
            resendBtn.style.opacity = "1";
        }
    }, 1000);
}


/* ---------------- SHOW OTP (GLOBAL because HTML calls it) ---------------- */

function showOTP() {

    const phoneInput = document.querySelector(".phone-input input").value;
    const termsChecked = document.getElementById("terms").checked;

    if (phoneInput.length !== 10) {
        alert("Please enter valid 10 digit mobile number");
        return;
    }

    if (!termsChecked) {
        alert("Please accept Terms & Conditions");
        return;
    }

    document.getElementById("otpSection").style.display = "block";
    document.getElementById("userNumber").innerText = phoneInput;
    document.querySelector(".login-btn").style.display = "none";

    startTimer();   // ✅ Now works
}


/* ---------------- DOM READY CODE ---------------- */

document.addEventListener("DOMContentLoaded", function () {

    /* -------- RESEND CLICK -------- */

    document.getElementById("resendBtn").addEventListener("click", function () {
        startTimer();
        console.log("OTP Resent (Simulation)");
    });


    /* -------- PASSWORD TOGGLE -------- */

    document.getElementById("passwordToggle").addEventListener("click", function () {

        const otpContainer = document.getElementById("otpContainer");

        document.getElementById("otpHeading").innerText = "Enter Password";
        document.getElementById("otpSubtitle").style.display = "none";
        document.getElementById("resendWrapper").style.display = "none";

        otpContainer.innerHTML = `
            <input type="password" 
                   placeholder="Enter Password" 
                   style="width:100%; padding:10px; border-radius:6px; border:1px solid #b89c6a;">
        `;

        const verifyBtn = document.querySelector(".verify-btn");
        verifyBtn.textContent = "Login";
        verifyBtn.onclick = function () {
            window.location.href = "index.html";
        };
    });

});