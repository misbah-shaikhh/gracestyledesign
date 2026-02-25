 


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

const profileIcon = document.getElementById("profileIcon");

if (profileIcon && profileOverlay) {

  profileIcon.addEventListener("click", function (e) {
    e.stopPropagation();
    profileOverlay.classList.toggle("show");
  });

  document.addEventListener("click", function (e) {
    if (!profileOverlay.contains(e.target) && e.target !== profileIcon) {
      profileOverlay.classList.remove("show");
    }
  });

}