/* // Input elements
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

// Homepage hero slider 
const track = document.querySelector(".slide-track");
const slides = document.querySelectorAll(".slide");
let index = 0;
let autoSlideInterval;

// update slide position
function updateSlide() {
  track.style.transform = `translateX(-${index * 100}%)`;
}

// next slide
function nextSlide() {
  index = (index + 1) % slides.length;
  updateSlide();
  resetAutoSlide();
}

// previous slide
function prevSlide() {
  index = (index - 1 + slides.length) % slides.length;
  updateSlide();
  resetAutoSlide();
}

// auto slide function
function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 6000); // slower & smooth
}

// reset auto slide when user clicks arrows
function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

// start slider initially
startAutoSlide();

function scrollProducts(direction) {
  const track = document.querySelector(".product-track");

  const cardWidth = 443;   // your card width
  const gap = 56;          // space between cards
  const scrollAmount = cardWidth + gap;

  track.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth"
  });
}
// wishlist heart 

document.querySelectorAll(".heart").forEach(icon => {
  icon.addEventListener("click", () => {
    icon.classList.toggle("fa-regular");
    icon.classList.toggle("fa-solid");
    icon.classList.toggle("active");
  });
});

// categories overlay 
const categoryBtn = document.getElementById("categoryBtn");
const overlay = document.getElementById("categoryOverlay");
const categoryBox = document.querySelector(".category-box");

// Open overlay
categoryBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  overlay.style.display = "block";
});

// Close when clicking outside
overlay.addEventListener("click", () => {
  overlay.style.display = "none";
});

// Prevent closing when clicking inside box
categoryBox.addEventListener("click", (e) => {
  e.stopPropagation();
});

// profile overlay 

const profileBtn = document.getElementById("profileBtn");
const profileOverlay = document.getElementById("profileOverlay");

// open profile overlay
profileBtn.addEventListener("click", () => {
  profileOverlay.style.display = "block";
});

// close when clicking outside
profileOverlay.addEventListener("click", (e) => {
  if (e.target === profileOverlay) {
    profileOverlay.style.display = "none";
  }
});

// range filter 
const range = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");

function updateRange() {
  const min = range.min;
  const max = range.max;
  const value = range.value;
  const percent = ((value - min) / (max - min)) * 100;

  // Update slider color
  range.style.background = `linear-gradient(
    to right,
    #6b2f1a 0%,
    #6b2f1a ${percent}%,
    #fff ${percent}%,
    #fff 100%
  )`;

  // Update text
  priceValue.innerText = Number(value).toLocaleString();
}

range.addEventListener("input", updateRange);
updateRange(); // initial load



        