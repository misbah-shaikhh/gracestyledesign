function renderStars(rating = 0) {
  const full = Math.floor(rating);
  const empty = 5 - full;

  return "★".repeat(full) + "☆".repeat(empty);
}
document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  if (!productId) return;

  try {

    // ---------------- CURRENT PRODUCT ----------------
    const res = await fetch(`https://gsd-backend-i5gj.onrender.com/api/products/${productId}`);
    if (!res.ok) throw new Error("Failed to fetch product");

    const p = await res.json();
    const images = Array.isArray(p.images) ? p.images : [];

    const mainImage = document.getElementById("mainImage");
    if (mainImage) mainImage.src = (p.images && p.images.length > 0)
      ? p.images[0]
      : "../images/product.jpg";

    const titleEl = document.querySelector(".product-title");
    if (titleEl) titleEl.textContent = p.name;

    const priceEl = document.querySelector(".price-container .price");
    const originalPriceEl = document.querySelector(".price-container .original-price");
    const discountEl = document.querySelector(".discount-badge");

    const discounted = p.discountedPrice ?? p.originalPrice;
    const original = p.originalPrice ?? discounted;

    if (priceEl) priceEl.textContent = `Rs. ${discounted.toLocaleString()}`;
    if (originalPriceEl) originalPriceEl.textContent =
      discounted !== original ? `Rs. ${original.toLocaleString()}` : "";

    if (discountEl) discountEl.textContent =
      discounted !== original ? `Save ${original - discounted}` : "";

    // ⭐ RATING UI UPDATE
    const starsEl = document.getElementById("productStars");
    const ratingTextEl = document.getElementById("productRatingText");

    if (starsEl) {
      starsEl.textContent = renderStars(p.averageRating || 0);
    }

    if (ratingTextEl) {
      ratingTextEl.textContent = `(${p.totalReviews || 0} Reviews)`;
    }
    // ---------------- SIZE OPTIONS ----------------
    const sizeContainer = document.querySelector(".size-options");

    if (sizeContainer && p.variants) {
      sizeContainer.innerHTML = "";

      const uniqueSizes = [...new Set(p.variants.map(v => v.size))];

      uniqueSizes.forEach(size => {
        const btn = document.createElement("button");
        btn.classList.add("size-btn");
        btn.textContent = size;

        btn.addEventListener("click", () => {
          document.querySelectorAll(".size-btn").forEach(b => b.style.opacity = "0.7");
          btn.style.opacity = "1";
        });

        sizeContainer.appendChild(btn);
      });
    }



    // ---------------- COLOR OPTIONS ----------------
    const colorContainer = document.querySelector(".color-options");
    const colorNameEl = document.querySelector(".color-name");

    if (colorContainer && p.variants) {

      colorContainer.innerHTML = "";

      const uniqueColors = [...new Set(p.variants.map(v => v.color))];

      uniqueColors.forEach((color, i) => {

        const div = document.createElement("div");
        div.classList.add("color-option");

        if (i === 0) div.classList.add("active");

        div.style.backgroundColor = color;
        div.dataset.color = color;

        div.addEventListener("click", () => {

          document.querySelectorAll(".color-option")
            .forEach(c => c.classList.remove("active"));

          div.classList.add("active");

          if (colorNameEl) colorNameEl.textContent = color;

          const variantImg = p.variants.find(v => v.color === color)?.image;

          if (mainImage && p.images?.length > 0) {
            mainImage.src = p.images[0];
          }

        });

        colorContainer.appendChild(div);
      });

      if (colorNameEl) colorNameEl.textContent = uniqueColors[0];
    }



    // ---------------- THUMBNAILS ----------------
    const thumbnailGallery = document.querySelector(".thumbnail-gallery");

    if (thumbnailGallery) {

      thumbnailGallery.innerHTML = "";

      if (images.length === 0) return;

      images.slice(0, 3).forEach((img, i) => {

        const thumbDiv = document.createElement("div");
        thumbDiv.classList.add("thumbnail");

        if (i === 0) thumbDiv.classList.add("active");

        thumbDiv.innerHTML = `<img src="${img}" alt="${p.name} thumbnail">`;

        thumbDiv.addEventListener("click", () => {

          document.querySelectorAll(".thumbnail")
            .forEach(t => t.classList.remove("active"));

          thumbDiv.classList.add("active");

          if (mainImage) mainImage.src = img;

        });

        thumbnailGallery.appendChild(thumbDiv);

      });
    }



    // ---------------- PRODUCT DETAILS ----------------
    const detailsGrid = document.querySelector(".details-grid");

    if (detailsGrid && p.description) {

      detailsGrid.innerHTML = "";

      for (const [label, value] of Object.entries(p.description)) {

        const item = document.createElement("div");

        item.classList.add("detail-item");

        item.innerHTML = `
          <span class="detail-label">${label}</span>
          <span class="detail-value">${value}</span>
        `;

        detailsGrid.appendChild(item);
      }
    }



    // ---------------- RELATED PRODUCTS ----------------

    const relatedTrack = document.querySelector(".related-products .product-track");

    if (relatedTrack) {

      const allRes = await fetch("https://gsd-backend-i5gj.onrender.com/api/products");
      const allProducts = await allRes.json();

      const filtered = allProducts.filter(prod => prod._id !== productId);

      const shuffled = filtered.sort(() => 0.5 - Math.random());

      const selected = shuffled.slice(0, 6);

      relatedTrack.innerHTML = "";

      selected.forEach(prod => {

        const card = document.createElement("div");
        card.classList.add("product-card");

        card.dataset.id = prod._id;

        card.innerHTML = `
          <div class="cart-tag">Add to Cart</div>

          <img src="${prod.images?.[0] || "../images/product.jpg"}">

          <div class="right-info">
            <div class="rating">
  ⭐ ${(prod.averageRating || 0).toFixed(1)}
</div>
            <div class="wishlist wishlist-btn">
              <i class="fa-regular fa-heart heart"></i>
            </div>
          </div>

          <div class="product-info">
            <h3>${prod.name}</h3>

            <p class="price">
              ₹${prod.discountedPrice.toLocaleString()}
              <span>₹${prod.originalPrice.toLocaleString()}</span>
            </p>

            <div class="colors"></div>
          </div>
        `;

        card.addEventListener("click", () => {
          window.location.href = `prodview.html?id=${prod._id}`;
        });

        relatedTrack.appendChild(card);

      });

    }



  } catch (err) {

    console.error("Error fetching product:", err);

    const container = document.querySelector(".product-container");

    if (container)
      container.innerHTML = "<p style='padding:20px;'>Product not found.</p>";

  }

  // ⭐ AFTER PRODUCT IS LOADED
loadReviews(productId);

});

/* =============================
   GLOBAL STATE
============================= */

let selectedSize = null;
let selectedColor = null;
let currentProduct = null;


/* =============================
   LOAD PRODUCT
============================= */

document.addEventListener("DOMContentLoaded", async () => {

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  if (!productId) return;

  try {

    const res = await fetch(`https://gsd-backend-i5gj.onrender.com/api/products/${productId}`);
    const p = await res.json();

    currentProduct = p;

    const mainImage = document.getElementById("mainImage");
    if (mainImage) mainImage.src = (p.images && p.images.length > 0)
      ? p.images[0]
      : "../images/product.jpg";


    const titleEl = document.querySelector(".product-title");
    if (titleEl) titleEl.textContent = p.name;

    const priceEl = document.querySelector(".price-container .price");
    const originalPriceEl = document.querySelector(".price-container .original-price");

    const discounted = p.discountedPrice ?? p.originalPrice;
    const original = p.originalPrice ?? discounted;

    if (priceEl) priceEl.textContent = `Rs. ${discounted.toLocaleString()}`;
    if (originalPriceEl) originalPriceEl.textContent =
      discounted !== original ? `Rs. ${original.toLocaleString()}` : "";


    /* =============================
       SIZE OPTIONS
    ============================= */

    const sizeContainer = document.querySelector(".size-options");

    if (sizeContainer && p.variants) {

      sizeContainer.innerHTML = "";

      const uniqueSizes = [...new Set(p.variants.map(v => v.size))];

      uniqueSizes.forEach(size => {

        const btn = document.createElement("button");
        btn.classList.add("size-btn");
        btn.textContent = size;

        btn.addEventListener("click", () => {

          document.querySelectorAll(".size-btn").forEach(b =>
            b.classList.remove("active")
          );

          btn.classList.add("active");

          selectedSize = size;

        });

        sizeContainer.appendChild(btn);

      });

    }


    /* =============================
       COLOR OPTIONS
    ============================= */

    const colorContainer = document.querySelector(".color-options");
    const colorNameEl = document.querySelector(".color-name");

    if (colorContainer && p.variants) {

      colorContainer.innerHTML = "";

      const uniqueColors = [...new Set(p.variants.map(v => v.color))];

      uniqueColors.forEach((color, i) => {

        const div = document.createElement("div");
        div.classList.add("color-option");

        div.style.backgroundColor = color;
        div.dataset.color = color;

        if (i === 0) {
          div.classList.add("active");
          selectedColor = color;
        }

        div.addEventListener("click", () => {

          document.querySelectorAll(".color-option")
            .forEach(c => c.classList.remove("active"));

          div.classList.add("active");

          selectedColor = color;

          if (colorNameEl) colorNameEl.textContent = color;

          const variantImg = p.variants.find(v => v.color === color)?.image;

          if (variantImg) mainImage.src = variantImg;

        });

        colorContainer.appendChild(div);

      });

      if (colorNameEl) colorNameEl.textContent = uniqueColors[0];

    }


  } catch (err) {

    console.error("Error fetching product:", err);

  }

});


/* =============================
   ADD TO CART (DB VERSION)
============================= */

document.addEventListener("click", async (e) => {

  if (!e.target.closest(".btn-secondary")) return;

  if (!currentProduct) return;

  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("Please login first");
    return;
  }

  if (!selectedSize) {
    alert("Please select a size");
    return;
  }

  if (!selectedColor) {
    alert("Please select a color");
    return;
  }

  try {

    await fetch("https://gsd-backend-i5gj.onrender.com/api/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        productId: currentProduct._id,
        size: selectedSize,
        color: selectedColor,
        quantity: 1
      })
    });

    alert("Product added to cart");

  } catch (err) {
    console.error("Cart add error:", err);
    alert("Failed to add to cart");
  }

});

// reviewsss 
async function loadReviews(productId) {
  try {
    const res = await fetch(
      `https://gsd-backend-i5gj.onrender.com/api/reviews/product/${productId}`
    );

    let reviews = await res.json();

    // ⭐ ALL REVIEWS (for rating calculation)
    const allReviews = reviews;

    // ⭐ ONLY APPROVED (for UI display)
    const approvedReviews = reviews.filter(
      r => r.status === "approved"
    );

    renderReviewStats(allReviews);
    renderReviewList(approvedReviews);

  } catch (err) {
    console.error("Review load error:", err);
  }
}

function renderReviewStats(reviews) {

  const total = reviews.length;

  let sum = 0;
  const starCount = [0, 0, 0, 0, 0];

  reviews.forEach(r => {
    sum += r.rating;
    starCount[r.rating - 1]++;
  });

  const avg = total ? (sum / total).toFixed(1) : 0;

  // UI updates
  document.querySelector(".total-reviews").textContent = `${total} Ratings`;
  document.querySelector(".overall-score").textContent = avg;
  document.querySelector(".overall-stars").textContent = renderStars(avg);

  // update bars
  for (let i = 5; i >= 1; i--) {

    const count = starCount[i - 1];
    const percent = total ? (count / total) * 100 : 0;

    const bar = document.querySelectorAll(".rating-bar")[5 - i];

    if (bar) {
      bar.querySelector(".bar-count").textContent = count;
      bar.querySelector(".bar-fill").style.width = `${percent}%`;
    }
  }
}

function renderReviewList(reviews) {

  const container = document.querySelector(".review-list");
  container.innerHTML = "";

  reviews.forEach(r => {

    const date = new Date(r.createdAt).toLocaleDateString();

    const initial = r.userId?.name?.charAt(0).toUpperCase() || "U";

    const div = document.createElement("div");
    div.classList.add("review-item");

    div.innerHTML = `
      <div class="review-header">
        <div class="reviewer-avatar">${initial}</div>

        <div class="reviewer-info">
          <div class="reviewer-name">${r.userId?.name || "User"}</div>
          <div class="review-stars">${renderStars(r.rating)}</div>
        </div>

        <div class="review-date">${date}</div>
      </div>

      <div class="review-text">
        ${r.reviewText}
      </div>
    `;

    container.appendChild(div);
  });
}