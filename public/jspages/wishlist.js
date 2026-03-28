document.addEventListener("DOMContentLoaded", async () => {

  const track = document.querySelector(".wishlist-section .product-track");

  if (!track) {
    console.error("Wishlist track not found");
    return;
  }

  const userId = localStorage.getItem("userId");

  // prevent /wishlist/null API call
  if (!userId) {
    track.innerHTML = "<p>Please login to view your wishlist.</p>";
    return;
  }

  try {

    const res = await fetch(`http://localhost:5000/api/wishlist/${userId}`);

    if (!res.ok) {
      throw new Error("Failed to load wishlist");
    }

    const products = await res.json();

    if (!Array.isArray(products)) {
      console.error("Wishlist API did not return an array", products);
      track.innerHTML = "<p>Unable to load wishlist.</p>";
      return;
    }

    // Empty wishlist
    if (products.length === 0) {
      track.innerHTML = "<p>Your wishlist is empty.</p>";
      return;
    }

    track.innerHTML = "";

products.forEach(product => {
  const card = document.createElement("div");
  card.classList.add("product-card");
  card.dataset.id = product._id;

  card.innerHTML = `
    <img src="${product.images?.[0] || "../images/product.jpg"}" alt="${product.name}">
    <div class="right-info">
      <div class="rating">⭐ 4.5</div>
      <div class="wishlist wishlist-btn">
        <i class="fa-regular fa-solid fa-heart heart"></i>
      </div>
    </div>
    <div class="product-info">
      <h3>${product.name}</h3>
      <p class="price">
        ₹${product.discountedPrice?.toLocaleString() || product.price}
        ${product.originalPrice ? `<span>₹${product.originalPrice.toLocaleString()}</span>` : ""}
      </p>
      <div class="colors"></div>
    </div>
  `;

  // Redirect card click
  card.addEventListener("click", () => {
    window.location.href = `../htmlpages/prodview.html?id=${product._id}`;
  });

  // Stop card click when heart is clicked & toggle wishlist
  const heartBtn = card.querySelector(".wishlist-btn");
  if (heartBtn) {
    heartBtn.addEventListener("click", e => {
      e.stopPropagation();
      // Your existing toggle logic, e.g.
      if (!isLoggedIn()) return redirectLogin();
      fetch("http://localhost:5000/api/wishlist/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId: product._id })
      }).then(() => syncWishlistHearts());
    });
  }

  track.appendChild(card);
});

// Sync hearts after all cards appended
syncWishlistHearts();

  } catch (err) {

    console.error("Wishlist load error", err);
    track.innerHTML = "<p>Error loading wishlist.</p>";

  }

});