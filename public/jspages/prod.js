document.addEventListener("DOMContentLoaded", async () => {

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  if (!productId) return;

  try {

    // ---------------- CURRENT PRODUCT ----------------
    const res = await fetch(`/api/products/${productId}`);
    if (!res.ok) throw new Error("Failed to fetch product");

    const p = await res.json();

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

          if (variantImg && mainImage) mainImage.src = variantImg;

        });

        colorContainer.appendChild(div);
      });

      if (colorNameEl) colorNameEl.textContent = uniqueColors[0];
    }



    // ---------------- THUMBNAILS ----------------
    const thumbnailGallery = document.querySelector(".thumbnail-gallery");

    if (thumbnailGallery && p.variants) {

      thumbnailGallery.innerHTML = "";

      const thumbnails = p.variants.slice(0, 3);

      thumbnails.forEach((v, i) => {

        const thumbDiv = document.createElement("div");
        thumbDiv.classList.add("thumbnail");

        if (i === 0) thumbDiv.classList.add("active");

        const thumbImg = p.images?.[0] || "../images/product.jpg";

        thumbDiv.innerHTML = `<img src="${thumbImg}" alt="${p.name} thumbnail">`;

        thumbDiv.addEventListener("click", () => {

          document.querySelectorAll(".thumbnail")
            .forEach(t => t.classList.remove("active"));

          thumbDiv.classList.add("active");

          if (mainImage) mainImage.src = thumbImg;

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

      const allRes = await fetch("/api/products");
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
            <div class="rating">⭐ 4.5</div>
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

    const res = await fetch(`/api/products/${productId}`);
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
   ADD TO CART
============================= */

document.addEventListener("click", (e) => {

  if (!e.target.closest(".btn-secondary")) return;

  if (!currentProduct) return;

  if (!selectedSize) {
    alert("Please select a size");
    return;
  }

  if (!selectedColor) {
    alert("Please select a color");
    return;
  }

  const product = {

    productId: currentProduct._id,
    name: currentProduct.name,
    images: currentProduct.images,
    price: currentProduct.discountedPrice,
    originalPrice: currentProduct.originalPrice,
    size: selectedSize,
    color: selectedColor,
    quantity: 1

  };

  let cart = JSON.parse(localStorage.getItem("cart")) || [];


  const existing = cart.find(item =>
    item.productId === product.productId &&
    item.size === product.size &&
    item.color === product.color
  );


  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push(product);

  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Product added to cart");

});