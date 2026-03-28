document.addEventListener("DOMContentLoaded", () => {

  // ---------------------- HERO SLIDER ----------------------
  const track = document.querySelector(".slide-track");
  const slides = document.querySelectorAll(".slide");
  let index = 0;
  let autoSlideInterval;

  function updateSlide() {
    track.style.transform = `translateX(-${index * 100}%)`;
  }

  function nextSlide() {
    index = (index + 1) % slides.length;
    updateSlide();
    resetAutoSlide();
  }

  function prevSlide() {
    index = (index - 1 + slides.length) % slides.length;
    updateSlide();
    resetAutoSlide();
  }

  function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 6000);
  }

  function resetAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
  }

  startAutoSlide();

  // ---------------------- PRODUCT SCROLL FUNCTION ----------------------
  window.scrollProducts = function(direction, containerSelector, viewAllUrl) {
    const track = document.querySelector(containerSelector || ".product-track");
    if (!track) return;

    const cardWidth = 443; // adjust based on your design
    const gap = 56;
    const scrollAmount = cardWidth + gap;

    // Check if scrolling would reach end
    const maxScroll = track.scrollWidth - track.clientWidth;
    const nextScroll = track.scrollLeft + direction * scrollAmount;

    if ((direction > 0 && nextScroll >= maxScroll) && viewAllUrl) {
      window.location.href = viewAllUrl; // go to view all page
    } else {
      track.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
    }
  };

  // ---------------------- RANGE SLIDER ----------------------
  const range = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");

  if (range && priceValue) {
    function updateRange() {
      const min = range.min;
      const max = range.max;
      const value = range.value;
      const percent = ((value - min) / (max - min)) * 100;

      range.style.background = `linear-gradient(
        to right,
        #6b2f1a 0%,
        #6b2f1a ${percent}%,
        #fff ${percent}%,
        #fff 100%
      )`;

      priceValue.innerText = Number(value).toLocaleString();
    }

    range.addEventListener("input", updateRange);
    updateRange();
  }

  // ---------------------- PRODUCT SECTIONS ----------------------
  const limitedTrack = document.querySelector(".limited-section .product-track");
  const newlyTrack = document.querySelector(".newly-added-section .product-track");
  const bestsellerTrack = document.querySelector(".bestsellers .product-track");

  let allProducts = [];

  async function loadHomepageProducts() {
    try {
      const res = await fetch("http://localhost:5000/api/products");
      allProducts = await res.json();

      renderLimitedCollection();
      renderNewlyAdded();
      renderBestsellers();
      setTimeout(syncWishlistHearts, 100);
    } catch (err) {
      console.error(err);
      alert("Failed to load products");
    }
  }

  function renderLimitedCollection() {
    if (!limitedTrack) return;
    limitedTrack.innerHTML = "";
    const limitedProducts = [...allProducts].sort((a,b) => a.totalStock - b.totalStock).slice(0,3);
    limitedProducts.forEach(p => limitedTrack.appendChild(createProductCard(p)));
  }

  function renderNewlyAdded() {
    if (!newlyTrack) return;
    newlyTrack.innerHTML = "";
    const newProducts = [...allProducts].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,3);
    newProducts.forEach(p => newlyTrack.appendChild(createProductCard(p,true)));
  }

  function renderBestsellers() {
    if (!bestsellerTrack) return;
    bestsellerTrack.innerHTML = "";
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    shuffled.slice(0,3).forEach(p => bestsellerTrack.appendChild(createProductCard(p)));
  }

  function createProductCard(product, isNew = false) {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.dataset.id = product._id; // <-- Use MongoDB _id for prod view

    const discountPercent = product.discountPercentage || 0;

    card.innerHTML = `
      <div class="${isNew ? 'new-tag' : 'discount-tag'}">
        ${isNew ? 'NEW' : discountPercent > 0 ? discountPercent + '% OFF' : ''}
      </div>
      <img src="${product.images?.[0] || '../images/product.jpg'}" alt="${product.name}">
      <div class="right-info">
        <div class="rating">⭐ 4.5</div>
        <div class="wishlist wishlist-btn"><i class="fa-regular fa-heart heart"></i></div>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p class="price">₹${product.discountedPrice.toLocaleString()} 
          ${product.discountedPrice !== product.originalPrice ? `<span>₹${product.originalPrice.toLocaleString()}</span>` : ''}
        </p>
        <div class="colors">${generateColorDots(product.variants)}</div>
      </div>
    `;
    return card;
  }

  function generateColorDots(variants) {
    if (!variants || !variants.length) return "";
    const uniqueColors = [...new Set(variants.map(v=>v.color))].slice(0,5);
    return uniqueColors.map((color,i) => `<span class="c${i+1}" style="background-color:${color.toLowerCase()}"></span>`).join("");
  }

  // ---------------------- SYNC WISHLIST HEARTS ----------------------

async function syncWishlistHearts() {

  const userId = localStorage.getItem("userId");
  if (!userId) return;

  try {

    const res = await fetch(`http://localhost:5000/api/wishlist/${userId}`);
    const wishlist = await res.json();

    // convert ids to strings
    const wishlistIds = wishlist.map(p => p._id.toString());

    document.querySelectorAll(".product-card").forEach(card => {

      const productId = card.dataset.id;
      const heart = card.querySelector(".heart");

      if (!heart) return;

      if (wishlistIds.includes(productId)) {

        heart.classList.remove("fa-regular");
        heart.classList.add("fa-solid");
        heart.style.color = "#e63946";

      } else {

        heart.classList.remove("fa-solid");
        heart.classList.add("fa-regular");
        heart.style.color = "";

      }

    });

  } catch (err) {

    console.error("Wishlist sync error:", err);

  }

}
 
  // ---------------------- PRODUCT CARD CLICK ----------------------
document.addEventListener("click", (e) => {

  // ---------------- WISHLIST CLICK ----------------
  const heartBtn = e.target.closest(".wishlist-btn");

  if (heartBtn) {

    e.stopPropagation();

    // prevent rapid double clicks
    if (heartBtn.classList.contains("loading")) return;
    heartBtn.classList.add("loading");

    const userId = localStorage.getItem("userId");

    if (!userId) {
      window.location.href = "../htmlpages/login.html";
      return;
    }

    const card = heartBtn.closest(".product-card");
    const productId = card.dataset.id;

    fetch("http://localhost:5000/api/wishlist/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        productId
      })
    })
    .then(() => syncWishlistHearts())
    .catch(err => console.error("Wishlist toggle error:", err))
    .finally(() => heartBtn.classList.remove("loading"));

    return; // stop product redirect
  }

  // ---------------- PRODUCT CARD CLICK ----------------
  const card = e.target.closest(".product-card");

  if (card && card.dataset.id) {
    window.location.href = `../htmlpages/prodview.html?id=${card.dataset.id}`;
  }

  // ---------------- SALE BADGE ----------------
  if (e.target.closest(".sale-badge")) {
    alert("Item added to cart!");
  }

});

  loadHomepageProducts();
});