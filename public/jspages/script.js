
/* =========================
   LOGIN CHECK (GLOBAL)
========================= */

function isLoggedIn() {
  return !!localStorage.getItem("token");
}

function redirectLogin() {
  window.location.href = "../htmlpages/login.html";
}

/* =========================
   SYNC WISHLIST HEARTS
   (Used across all pages)
========================= */

async function syncWishlistHearts() {

  const userId = localStorage.getItem("userId");
  if (!userId) return;

  try {

    const res = await fetch(`https://gsd-backend-i5gj.onrender.com/api/wishlist/${userId}`);
    const wishlist = await res.json();

    const wishlistIds = wishlist.map(p => p._id);

    document.querySelectorAll(".product-card").forEach(card => {

      const productId = card.dataset.id;
      const heart = card.querySelector(".wishlist-btn i, .wishlist-btn");

      if (!heart) return;

      if (wishlistIds.includes(productId)) {
        heart.classList.remove("fa-regular");
        heart.classList.add("fa-solid");
      } else {
        heart.classList.remove("fa-solid");
        heart.classList.add("fa-regular");
      }

    });

  } catch (err) {
    console.error("Wishlist sync error", err);
  }

}


/* =========================
   WISHLIST HEART TOGGLE
========================= */

document.addEventListener("click", async (e) => {

  const heartBtn = e.target.closest(".wishlist-btn");
  if (!heartBtn) return;

  e.stopPropagation();

  const card = heartBtn.closest(".product-card");
  if (!card) return;

  const productId = card.dataset.id;
  const userId = localStorage.getItem("userId");

if (!isLoggedIn()) {
  redirectLogin();
  return;
}

  try {

    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/wishlist/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        productId
      })
    });

    await res.json();

    /* re-sync hearts across page */
    syncWishlistHearts();

  } catch (err) {
    console.error("Wishlist error", err);
  }

});


/* =========================
   LOAD WISHLIST ON PAGE LOAD
========================= */

document.addEventListener("DOMContentLoaded", () => {
  syncWishlistHearts();
});


/* =========================
   CATEGORY OVERLAY
========================= */

const categoryBtn = document.getElementById("categoryBtn");
const overlay = document.getElementById("categoryOverlay");
const categoryBox = document.querySelector(".category-box");

if (categoryBtn && overlay && categoryBox) {

  categoryBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    overlay.style.display = "block";
      loadCategories();
  });

  overlay.addEventListener("click", () => {
    overlay.style.display = "none";
  });

  categoryBox.addEventListener("click", (e) => {
    e.stopPropagation();
  });

}


/* =========================
   PROFILE OVERLAY
========================= */
const profileBtn = document.getElementById("profileBtn");
const profileOverlay = document.getElementById("profileOverlay");
const profileIcon = document.getElementById("profileIcon");

if (profileBtn && profileOverlay) {

  profileBtn.addEventListener("click", () => {
    if (!isLoggedIn()) {
      redirectLogin();
      return;
    }
    profileOverlay.classList.add("show");
  });

  profileOverlay.addEventListener("click", (e) => {
    if (e.target === profileOverlay) {
      profileOverlay.classList.remove("show");
    }
  });

  if (profileIcon) {
    profileIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      profileOverlay.classList.toggle("show");
    });
  }

  document.addEventListener("click", (e) => {
    if (!profileOverlay.contains(e.target) && e.target !== profileIcon) {
      profileOverlay.classList.remove("show");
    }
  });

}


/* =========================
   PRODUCT CARD REDIRECT
========================= */

document.addEventListener("click", (e) => {

  const card = e.target.closest(".product-card");
  if (!card) return;

  /* prevent redirect when clicking wishlist */
  if (e.target.closest(".wishlist-btn")) return;

  const productId = card.dataset.id;
  if (!productId) return;

  window.location.href = `../htmlpages/prodview.html?id=${productId}`;

});

profileBtn.addEventListener("click", () => {

  if (!isLoggedIn()) {
    redirectLogin();
    return;
  }

  profileOverlay.style.display = "block";

});

/* =========================
   LOGOUT
========================= */
function logoutUser() {
  // clear user data
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("wishlist");

  // hide overlay properly
  if (profileOverlay) {
    profileOverlay.classList.remove("show");
  }

  // redirect smoothly
  setTimeout(() => {
    redirectLogin();
  }, 100);
}

document.addEventListener("click", (e) => {
  if (e.target.closest("#logoutBtn")) {
    e.preventDefault();
    logoutUser();
  }
});

// category overlay 
async function loadCategories() {
  try {
    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/categories");
    const data = await res.json();

    console.log("🔥 FULL RESPONSE:", data);

    const box = document.getElementById("categoryBox");
    if (!box) return;

    box.innerHTML = "";

    // 🔥 SAFE HANDLING
    let categories = [];

    if (Array.isArray(data)) {
      categories = data;
    } else if (Array.isArray(data.categories)) {
      categories = data.categories;
    } else {
      console.error("❌ Invalid categories format:", data);
      return;
    }

    categories.forEach(cat => {
      const h4 = document.createElement("h4");

      h4.innerHTML = `
        <a href="#" onclick="goToCategory('${cat.name}')">
          ${cat.name}
        </a>
      `;

      box.appendChild(h4);
    });

  } catch (err) {
    console.error("Category load error:", err);
  }
}

function goToCategory(categoryName) {
  window.location.href = `../htmlpages/productcatalogue.html?category=${encodeURIComponent(categoryName)}`;
}

function renderRating(rating = 0) {
  if (!rating) return "—"; // cleaner than "No rating"

  return `${Number(rating).toFixed(1)}`;
}

// for overlays 
const categoryBtn = document.querySelector("#categoriesBtn"); // your nav item
const categoryOverlay = document.getElementById("categoryOverlay");
const categoryBox = document.getElementById("categoryBox");

categoryBtn.addEventListener("click", (e) => {
  const rect = categoryBtn.getBoundingClientRect();

  categoryOverlay.style.display = "block";

  categoryBox.style.top = rect.bottom + "px";
  categoryBox.style.left = rect.left + "px";
});
const profileBtn = document.querySelector("#profileBtn");
const profileOverlay = document.getElementById("profileOverlay");
const profileBox = document.querySelector(".profile-box");

profileBtn.addEventListener("click", () => {
  const rect = profileBtn.getBoundingClientRect();

  profileOverlay.style.display = "block";

  profileBox.style.top = rect.bottom + "px";
  profileBox.style.left = rect.right - profileBox.offsetWidth + "px";
});
categoryOverlay.addEventListener("click", (e) => {
  if (!categoryBox.contains(e.target)) {
    categoryOverlay.style.display = "none";
  }
});

profileOverlay.addEventListener("click", (e) => {
  if (!profileBox.contains(e.target)) {
    profileOverlay.style.display = "none";
  }
});