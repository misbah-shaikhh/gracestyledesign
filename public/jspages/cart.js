const methodOverlay = document.getElementById("methodOverlay");
const methodBox = document.getElementById("methodBox");

const placeOrderBtn = document.querySelector(".place-order-btn");
const nextBtn = document.querySelector(".next-btn");
const closeMethodOverlay = document.getElementById("closeMethodOverlay");

const addressOverlay = document.getElementById("addressOverlay");
const cancelOverlay = document.getElementById("cancelOverlay");
const saveBtn = document.querySelector(".saveAddressBtn");

const paymentOverlay = document.getElementById("paymentOverlay");
const paymentBox = document.getElementById("paymentBox");
const closePaymentOverlay = document.getElementById("closePaymentOverlay");

/* ADDRESS FORM INPUTS */

const nameInput = document.querySelector(".nameInput");
const phoneInput = document.querySelector(".phoneInput");
const pincodeInput = document.querySelector(".pincodeInput");
const stateInput = document.querySelector(".stateInput");
const addressInput = document.querySelector(".addressInput");
const localityInput = document.querySelector(".landmarkInput");
const cityInput = document.querySelector(".cityInput");
const defaultInput = document.querySelector(".defaultAddress");

let selectedAddressId = null;
let cart = [];

// Mobile → numbers only
phoneInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
});

// Pincode → numbers only
pincodeInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
});

// Name → only letters
nameInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, "");
});

/* -------------------- */
/* OPEN METHOD OVERLAY */
/* -------------------- */

function openMethodOverlay() {
  if (methodOverlay) methodOverlay.style.display = "flex";
}

if (placeOrderBtn) placeOrderBtn.addEventListener("click", openMethodOverlay);
if (nextBtn) nextBtn.addEventListener("click", openMethodOverlay);

/* CLOSE METHOD */

if (closeMethodOverlay) {
  closeMethodOverlay.addEventListener("click", () => {
    methodOverlay.style.display = "none";
  });
}

if (methodOverlay && methodBox) {
  methodOverlay.addEventListener("click", function (e) {
    if (!methodBox.contains(e.target)) {
      methodOverlay.style.display = "none";
    }
  });
}

/* -------------------------- */
/* OPEN ADDRESS OVERLAY */
/* -------------------------- */

let editAddressId = null;

document.addEventListener("click", function (e) {

  if (e.target.classList.contains("add-btn")) {

    editAddressId = null;
    clearAddressForm();
    stateInput.value = "Maharashtra";
    stateInput.readOnly = true;

    methodOverlay.style.display = "none";
    addressOverlay.style.display = "flex";
  }

  if (e.target.classList.contains("edit-btn")) {

    editAddressId = e.target.dataset.id;

    const card = e.target.closest(".address-card");
    if (!card) return;

    nameInput.value = card.dataset.name || "";
    phoneInput.value = card.dataset.phone || "";
    pincodeInput.value = card.dataset.pincode || "";
    stateInput.value = "Maharashtra";
    stateInput.readOnly = true;
    addressInput.value = card.dataset.address || "";
    localityInput.value = card.dataset.locality || "";
    cityInput.value = card.dataset.city || "";

    defaultInput.checked = card.dataset.default === "true";

    methodOverlay.style.display = "none";
    addressOverlay.style.display = "flex";
  }

});

/* -------------------------- */
/* CANCEL ADDRESS OVERLAY */
/* -------------------------- */

if (cancelOverlay) {
  cancelOverlay.addEventListener("click", () => {
    addressOverlay.style.display = "none";
    methodOverlay.style.display = "flex";
  });
}

if (addressOverlay) {
  addressOverlay.addEventListener("click", function (e) {

    const box = addressOverlay.querySelector(".overlay-box");
    if (!box) return;

    if (!box.contains(e.target)) {
      addressOverlay.style.display = "none";
      methodOverlay.style.display = "flex";
    }

  });
}

/* -------------------------- */
/* SAVE ADDRESS */
/* -------------------------- */

if (saveBtn) {

  saveBtn.addEventListener("click", async function () {

    const addressData = {
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      pincode: pincodeInput.value.trim(),
      state: stateInput.value.trim(),
      addressLine: addressInput.value.trim(),
      landmark: localityInput.value.trim(),
      city: cityInput.value.trim(),
      isDefault: defaultInput.checked
    };

    /* VALIDATION */

    // ================= VALIDATIONS =================

    // All fields required
    if (!addressData.name || !addressData.phone || !addressData.pincode ||
      !addressData.state || !addressData.addressLine || !addressData.city) {
      return showTopMessage("All fields are required");
    }

    // Name → only letters
    if (!/^[A-Za-z\s]+$/.test(addressData.name)) {
      return showTopMessage("Name must contain only alphabets");
    }

    // Mobile → Indian only
    if (!/^[6-9]\d{9}$/.test(addressData.phone)) {
      return showTopMessage("Enter valid Indian mobile number");
    }

    // Pincode → Maharashtra only
    if (!/^4\d{5}$/.test(addressData.pincode)) {
      return showTopMessage("Enter valid Maharashtra pincode");
    }

    // Force Maharashtra
    addressData.state = "Maharashtra";

    try {

      const url = editAddressId
        ? `https://gsd-backend-i5gj.onrender.com/api/addresses/${editAddressId}`
        : `https://gsd-backend-i5gj.onrender.com/api/addresses`;

      const res = await fetch(url, {
        method: editAddressId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(addressData)
      });

      const data = await res.json();

      if (res.ok) {

        addressOverlay.style.display = "none";
        methodOverlay.style.display = "flex";

        showTopMessage("Address Saved");

        setTimeout(() => {
          loadAddresses();
        }, 500);

      } else {
        showTopMessage(data.message || "Failed to save address");
      }

    } catch (err) {
      console.error(err);
      showTopMessage("Server Error");
    }

  });

}

/* -------------------------- */
/* CLEAR ADDRESS FORM */
/* -------------------------- */

function clearAddressForm() {

  nameInput.value = "";
  phoneInput.value = "";
  pincodeInput.value = "";
  stateInput.value = "Maharashtra"; // 🔥 default
  stateInput.readOnly = true;
  addressInput.value = "";
  localityInput.value = "";
  cityInput.value = "";
  defaultInput.checked = false;

}

/* -------------------------- */
/* TOP MESSAGE */
/* -------------------------- */

function showTopMessage(message) {

  const msg = document.createElement("div");
  msg.className = "top-message";
  msg.innerText = message;

  document.body.appendChild(msg);

  setTimeout(() => {
    msg.classList.add("show");
  }, 10);

  setTimeout(() => {
    msg.classList.remove("show");
    setTimeout(() => msg.remove(), 300);
  }, 2500);

}

/* -------------------------- */
/* LOAD SAVED ADDRESSES */
/* -------------------------- */

async function loadAddresses() {

  try {

    const container = document.getElementById("addressList");
    if (!container) return;

    const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/addresses", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();
    const addresses = data.addresses || data;

    addresses.sort((a, b) => b.isDefault - a.isDefault);

    container.innerHTML = "";

    if (!addresses.length) {
      container.innerHTML = `<p>No saved addresses yet</p>`;
      return;
    }

    addresses.forEach(addr => {

      container.innerHTML += `
        <div class="address-card"
          data-id="${addr._id}"
          data-name="${addr.name}"
          data-phone="${addr.phone}"
          data-pincode="${addr.pincode}"
          data-state="${addr.state}"
          data-address="${addr.addressLine}"
          data-locality="${addr.landmark}"
          data-city="${addr.city}"
          data-default="${addr.isDefault}">

          <p><b>${addr.name}</b> ${addr.isDefault ? "(Default)" : ""}</p>
          <p>${addr.phone}</p>
          <p>${addr.addressLine || ""}${addr.landmark ? ", " + addr.landmark : ""}</p>
          <p>${addr.city}, ${addr.state} - ${addr.pincode}</p>

          <button class="edit-btn" data-id="${addr._id}">
            Edit
          </button>

        </div>
      `;
    });

    /* -------------------------- */
    /* DEFAULT ADDRESS SELECTION */
    /* -------------------------- */

    const defaultCard = container.querySelector('.address-card[data-default="true"]');

    if (defaultCard) {
      defaultCard.classList.add("selected");
      selectedAddressId = defaultCard.dataset.id;
    }

    /* -------------------------- */
    /* CLICK TO SELECT ADDRESS */
    /* -------------------------- */

    container.querySelectorAll(".address-card").forEach(card => {

      card.addEventListener("click", function (e) {

        if (e.target.classList.contains("edit-btn")) return;

        container.querySelectorAll(".address-card")
          .forEach(c => c.classList.remove("selected"));

        card.classList.add("selected");

        selectedAddressId = card.dataset.id;

      });

    });

  } catch (err) {
    console.error("Address load error", err);
  }

}

loadAddresses();

/* -------------------------- */
/* ADD ADDRESS BUTTON */
/* -------------------------- */

const addBtn = document.getElementById("addAddressBtn");

if (addBtn) {
  addBtn.addEventListener("click", () => {

    editAddressId = null;
    clearAddressForm();

    methodOverlay.style.display = "none";
    addressOverlay.style.display = "flex";

  });
}
/* OPEN PAYMENT OVERLAY */
document.addEventListener("click", (e) => {

  const btn = e.target.closest(".confirm-order-btn");
  if (!btn) return;

  console.log("Opening payment overlay...");

  if (!selectedAddressId) {
    return showTopMessage("Please select an address");
  }

  methodOverlay.style.display = "none";

  if (paymentOverlay) {
    paymentOverlay.style.display = "flex";
  } else {
    console.error("paymentOverlay not found");
  }

});

/* -------------------------- */
/* CLOSE PAYMENT OVERLAY */
/* -------------------------- */

if (closePaymentOverlay) {
  closePaymentOverlay.addEventListener("click", () => {
    paymentOverlay.style.display = "none";
  });
}

if (paymentOverlay && paymentBox) {
  paymentOverlay.addEventListener("click", (e) => {
    if (!paymentBox.contains(e.target)) {
      paymentOverlay.style.display = "none";
    }
  });
}

/* -------------------------- */
/* PLACE FINAL ORDER */
/* -------------------------- */

document.querySelector(".final-order-btn")
  ?.addEventListener("click", async () => {

    const userId = localStorage.getItem("userId");

    if (!selectedAddressId) {
      return showTopMessage("No address selected");
    }

    if (!cart.length) {
      return showTopMessage("Cart is empty");
    }
    // 🔥 STOCK VALIDATION BEFORE ORDER
    for (let item of cart) {
      if (item.quantity > item.stock) {
        return showTopMessage(
          `${item.name} (${item.size}) only has ${item.stock} left`
        );
      }
    }

    try {

      const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}` // 🔥 ADD THIS
        },
        body: JSON.stringify({
          userId,
          addressId: selectedAddressId,
          items: cart,
          paymentMethod: "COD"
        })
      });

      const data = await res.json();

      if (res.ok) {

        showTopMessage("Order Placed Successfully 🎉");

        // 🔥 CLEAR CART FROM DB
        await fetch("https://gsd-backend-i5gj.onrender.com/api/cart/clear", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ userId })
        });

        paymentOverlay.style.display = "none";

        setTimeout(() => {
          window.location.href = "../htmlpages/userprofile.html?section=orders";
        }, 1500);
      } else {
        showTopMessage(data.message || "Order failed");
      }

    } catch (err) {
      console.error(err);
      showTopMessage("Server error");
    }

  });

/* ================================
   CART SYSTEM
================================ */

document.addEventListener("DOMContentLoaded", () => {

  const cartItemsContainer = document.querySelector(".cart-items");

  const totalMRPEl = document.getElementById("totalMRP");
  const discountEl = document.getElementById("totalDiscount");
  const totalAmountEl = document.getElementById("totalAmount");

  const cartCountEl = document.getElementById("cartCount");
  const overlayCountEl = document.getElementById("cartItemCount");

  async function loadCart() {

    const userId = localStorage.getItem("userId");
    if (!userId) return;

    try {

      const res = await fetch(`https://gsd-backend-i5gj.onrender.com/api/cart/${userId}`);

      if (!res.ok) {
        console.error("Cart fetch failed");
        return;
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("Cart is not array:", data);
        return;
      }

      cart = data.map(item => {

        const matchedVariant = item.productId.variants?.find(v =>
          v.color === item.color && v.size === item.size
        );

        return {
          productId: item.productId._id,
          name: item.productId.name,
          images: item.productId.images,
          price: item.productId.discountedPrice,
          originalPrice: item.productId.originalPrice,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          stock: matchedVariant?.stock || 0, // ✅ NOW WORKS
          sizes: [...new Set(
            item.productId.variants
              ?.filter(v => v.color === item.color && v.stock > 0)
              .map(v => v.size)
          )] || []
        };

      });

      renderCart();

    } catch (err) {
      console.error("Cart load error:", err);
    }
  }

  loadCart();


  /* =====================
     RENDER CART
  ===================== */

  function renderCart() {

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = "<p>Your cart is empty</p>";

      totalMRPEl.textContent = "₹0";
      discountEl.textContent = "₹0";
      totalAmountEl.textContent = "₹0";

      document.querySelectorAll("#deliveryFee").forEach(el => {
        el.textContent = "₹0";
      });

      if (cartCountEl) cartCountEl.textContent = 0;
      if (overlayCountEl) overlayCountEl.textContent = 0;

      return;
    }
    cartItemsContainer.innerHTML = "";

    let totalMRP = 0;
    let totalDiscount = 0;

    cart.forEach((item, index) => {

      const mrp = item.originalPrice * item.quantity;
      const sale = item.price * item.quantity;

      totalMRP += mrp;
      totalDiscount += (mrp - sale);

      const cartItem = document.createElement("div");
      cartItem.classList.add("cart-item");
      cartItem.dataset.id = item.productId; // 🔥 IMPORTANT

      cartItem.innerHTML = `

        <div class="cart-img">
          <img src="${(item.images && item.images.length > 0)
          ? item.images[0]
          : '../images/product.jpg'}">
        </div>

        <div class="cart-details">

          <h3>${item.name}</h3>

          <p class="subtitle">
            Colours: ${item.color}
          </p>

          <div class="cart-options">

            <div>
              <label>Size:</label>
              <select class="size-select" data-index="${index}">
                ${item.sizes.map(s => `
                  <option value="${s}" ${s === item.size ? "selected" : ""}>
                    ${s}
                  </option>
                `).join("")}
              </select>
            </div>

            <div>
              <label>Quantity:</label>
              <input 
                type="number" 
                class="qty-input" 
                value="${item.quantity}" 
                min="1" 
                max="${item.stock}"
                data-index="${index}">
            </div>

          </div>

          <div class="cart-price">
            ₹${item.price.toLocaleString()}
            <span>₹${item.originalPrice.toLocaleString()}</span>
          </div>

          <div class="cart-actions">
            <button class="remove-btn" data-index="${index}">
              Remove Item
            </button>
          </div>

        </div>

      `;
      const qtyInput = cartItem.querySelector(".qty-input");

      if (item.quantity > item.stock) {
        qtyInput.value = item.stock;

        const warning = document.createElement("p");
        warning.style.color = "red";
        warning.style.fontSize = "12px";
        warning.innerText = `Only ${item.stock} left in stock`;

        cartItem.querySelector(".cart-details").appendChild(warning);
      }
      cartItem.addEventListener("click", (e) => {

        // 🚫 Ignore clicks on interactive elements
        if (
          e.target.closest(".qty-input") ||
          e.target.closest(".size-select") ||
          e.target.closest(".remove-btn")
        ) {
          return;
        }

        // ✅ Only navigate if normal area clicked
        window.location.href = `../htmlpages/prodview.html?id=${item.productId}`;
      });
      cartItemsContainer.appendChild(cartItem);

    });


    /* =====================
       PRICE CALCULATION
    ===================== */

    const deliveryFee = 100;
    const totalAmount = totalMRP - totalDiscount + deliveryFee;

    document.querySelectorAll("#totalMRP").forEach(el => {
      el.textContent = `₹${totalMRP.toLocaleString()}`;
    });

    document.querySelectorAll("#totalDiscount").forEach(el => {
      el.textContent = `-₹${totalDiscount.toLocaleString()}`;
    });

    document.querySelectorAll("#deliveryFee").forEach(el => {
      el.textContent = `₹${deliveryFee}`;
    });

    document.querySelectorAll("#totalAmount").forEach(el => {
      el.textContent = `₹${totalAmount.toLocaleString()}`;
    });

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCountEl)
      cartCountEl.textContent = totalItems;

    if (overlayCountEl)
      overlayCountEl.textContent = totalItems;

  }


  /* =====================
     REMOVE ITEM
  ===================== */

  document.addEventListener("click", async (e) => {

    if (!e.target.classList.contains("remove-btn")) return;
    e.stopPropagation();

    const index = e.target.dataset.index;
    const item = cart[index];

    const userId = localStorage.getItem("userId");

    await fetch("https://gsd-backend-i5gj.onrender.com/api/cart/remove", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        productId: item.productId,
        size: item.size,
        color: item.color
      })
    });

    loadCart(); // 🔥 reload from DB
  });


  /* =====================
     UPDATE QUANTITY
  ===================== */

  document.addEventListener("change", async (e) => {

    if (!e.target.classList.contains("qty-input")) return;
    e.stopPropagation();

    const index = e.target.dataset.index;
    const item = cart[index];

    const userId = localStorage.getItem("userId");

    let newQty = parseInt(e.target.value);

    // ❌ Invalid values handling
    if (isNaN(newQty) || newQty < 1) {
      newQty = 1;
    }
    // 🔥 ADD THIS
    if (newQty > item.stock) {
      newQty = item.stock;
      showTopMessage(`Only ${item.stock} items available`);
    }
    // Update input visually also
    e.target.value = newQty;

    await fetch("https://gsd-backend-i5gj.onrender.com/api/cart/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: newQty
      })
    });

    loadCart(); // 🔥 reload
  });

  // Update size 
  document.addEventListener("change", async (e) => {

    if (!e.target.classList.contains("size-select")) return;

    e.stopPropagation();

    const index = e.target.dataset.index;
    const item = cart[index];

    const newSize = e.target.value;
    const userId = localStorage.getItem("userId");

    await fetch("https://gsd-backend-i5gj.onrender.com/api/cart/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        productId: item.productId,
        size: item.size, // old size
        color: item.color,
        newSize: newSize
      })
    });

    loadCart(); // refresh

  });

  /* =============================
     YOU MAY ALSO LIKE PRODUCTS
  ============================= */

  async function loadRecommendedProducts() {

    const container = document.getElementById("recommendTrack");
    if (!container) return;

    try {

      const res = await fetch("https://gsd-backend-i5gj.onrender.com/api/products");
      const products = await res.json();

      if (!products.length) return;

      /* RANDOMIZE PRODUCTS */

      const shuffled = products.sort(() => 0.5 - Math.random());

      const randomProducts = shuffled.slice(0, 3);

      container.innerHTML = "";

      randomProducts.forEach(product => {

        const discount = Math.round(
          ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100
        );

        const card = document.createElement("div");
        card.classList.add("product-card");
        card.dataset.id = product._id;

        card.innerHTML = `

        <div class="discount-tag">${discount}% OFF</div>

        <img src="${product.images?.[0] || '../images/product.jpg'}"
       alt="${product.name}"
       onerror="this.onerror=null;this.src='../images/product.jpg';">

        <div class="right-info">

<div class="rating">
  ${renderRating(product.averageRating)}
</div>

          <div class="wishlist-btn">
            <i class="fa-regular fa-heart"></i>
          </div>

        </div>

        <div class="product-info">

          <h3>${product.name}</h3>

          <p class="price">
            ₹${product.discountedPrice.toLocaleString()}
            <span>₹${product.originalPrice.toLocaleString()}</span>
          </p>

          <div class="colors"></div>

        </div>

      `;

        container.appendChild(card);

      });

    } catch (err) {
      console.error("Recommendation load error", err);
    }

  }

  loadRecommendedProducts();
});