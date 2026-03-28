const productGrid = document.getElementById("productGrid");
const range = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");
const sizeOptions = document.querySelectorAll(".size-options span");

let maxPrice = Number(range.value);
let selectedSizes = [];

// ----------------------
// SLIDER (Hero)
// ----------------------
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

// ----------------------
// RANGE SLIDER
// ----------------------
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
  maxPrice = Number(value);
  fetchAndRenderNewlyAdded();
}

range.addEventListener("input", updateRange);
updateRange();

// ----------------------
// SIZE FILTER
// ----------------------
sizeOptions.forEach(span => {
  span.addEventListener("click", () => {
    span.classList.toggle("selected");

    // Update selectedSizes array from the data-size attribute
    selectedSizes = Array.from(document.querySelectorAll(".size-options span.selected"))
      .map(el => el.dataset.size);

    // Fetch & render products after size selection changes
    fetchAndRenderNewlyAdded();
  });
});
// ----------------------
// CLEAR FILTER
// ----------------------
const clearFilterBtn = document.querySelector(".clear-filter");

clearFilterBtn.addEventListener("click", () => {
  // 1. Reset price slider
  range.value = range.max;
  maxPrice = Number(range.max);
  updateRange(); // this also updates priceValue and fetches products

  // 2. Remove size selections
  sizeOptions.forEach(span => span.classList.remove("selected"));
  selectedSizes = [];

  // 3. Fetch all products again
  fetchAndRenderNewlyAdded();
});

// ----------------------
// FETCH AND RENDER NEWLY ADDED PRODUCTS
// ----------------------
async function fetchAndRenderNewlyAdded() {
  if (!productGrid) return;

  try {
    const res = await fetch("/api/products"); // fetch all products
    let products = await res.json();

  // --- FILTER BY PRICE ---
products = products.filter(p => {
  const price = p.discountedPrice ?? p.originalPrice; // fallback to originalPrice
  return price <= maxPrice;
});

// --- FILTER BY SIZE ---
if (selectedSizes.length > 0) {
  products = products.filter(p => 
    p.variants?.some(v => selectedSizes.includes(v.size))
  );
}

    // --- SORT BY NEWEST FIRST ---
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // --- RENDER PRODUCTS ---
    productGrid.innerHTML = "";
    if (products.length === 0) {
      productGrid.innerHTML = "<p style='padding:20px;'>No products found.</p>";
      return;
    }

    products.forEach(p => {
  const card = document.createElement("div");
  card.classList.add("product-card");
card.dataset.id = p._id; // use the real MongoDB _id
card.addEventListener("click", () => {
  const id = card.dataset.id; // this is _id now
  window.location.href = `../htmlpages/prodview.html?id=${id}`;
});
  // Get first two colors
  const colors = p.colors?.slice(0, 2) || [];

  card.innerHTML = `
    <!-- IMAGE -->
    <div class="product-img">
      <img src="${p.images?.[0] || '../images/product.jpg'}" alt="${p.name}">
    </div>

    <!-- PRODUCT INFO -->
    <div class="product-info">
      <h3>${p.name}</h3>
      <p class="price">₹${p.discountedPrice?.toLocaleString() || 0} <span>₹${p.originalPrice?.toLocaleString() || 0}</span></p>

      <div class="info-row">

        <!-- COLORS -->
        <div class="colors">
          <span class="c1" style="background-color: ${colors[0] || 'transparent'}"></span>
          <span class="c2" style="background-color: ${colors[1] || 'transparent'}"></span>
        </div>

        <!-- RATING + HEART -->
        <div class="rating-heart">
          <span class="rating">⭐ ${p.rating || 4.5}</span>
          <i class="fa-regular fa-heart heart wishlist-btn"></i>
        </div>

      </div>
    </div>
  `;

  productGrid.appendChild(card);
});
// ✅ Sync hearts after all product cards are rendered
syncWishlistHearts();

  } catch (err) {
    console.error("Error fetching products:", err);
    productGrid.innerHTML = "<p style='padding:20px;'>Failed to load products.</p>";
  }
}
// Initial fetch
fetchAndRenderNewlyAdded();