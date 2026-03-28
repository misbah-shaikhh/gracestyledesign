const methodOverlay = document.getElementById("methodOverlay");
const methodBox = document.getElementById("methodBox");

const placeOrderBtn = document.querySelector(".place-order-btn");
const nextBtn = document.querySelector(".next-btn");
const closeMethodOverlay = document.getElementById("closeMethodOverlay");

const addressOverlay = document.getElementById("addressOverlay");
const cancelOverlay = document.getElementById("cancelOverlay");
const saveBtn = document.querySelector(".saveAddressBtn");

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
    stateInput.value = card.dataset.state || "";
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

    if (!addressData.name || !addressData.phone || !addressData.addressLine) {
      return showTopMessage("Please fill required fields");
    }

    if (!/^\d{10}$/.test(addressData.phone)) {
      return showTopMessage("Phone number must be 10 digits");
    }

    try {

      const url = editAddressId
        ? `http://localhost:5000/api/addresses/${editAddressId}`
        : `http://localhost:5000/api/addresses`;

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
  stateInput.value = "";
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

    const res = await fetch("http://localhost:5000/api/addresses", {
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

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  renderCart();


  /* =====================
     RENDER CART
  ===================== */

  function renderCart() {

    if (!cartItemsContainer) return;

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
              <select>
                <option selected>${item.size}</option>
              </select>
            </div>

            <div>
              <label>Quantity:</label>
              <input 
                type="number" 
                class="qty-input" 
                value="${item.quantity}" 
                min="1" 
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

      cartItemsContainer.appendChild(cartItem);

    });


    /* =====================
       PRICE CALCULATION
    ===================== */

    const platformFee = 23;
    const totalAmount = totalMRP - totalDiscount + platformFee;

    if (totalMRPEl)
      totalMRPEl.textContent = `₹${totalMRP.toLocaleString()}`;

    if (discountEl)
      discountEl.textContent = `-₹${totalDiscount.toLocaleString()}`;

    if (totalAmountEl)
      totalAmountEl.textContent = `₹${totalAmount.toLocaleString()}`;

    if (cartCountEl)
      cartCountEl.textContent = cart.length;

    if (overlayCountEl)
      overlayCountEl.textContent = cart.length;

  }


  /* =====================
     REMOVE ITEM
  ===================== */

  document.addEventListener("click", (e) => {

    if (!e.target.classList.contains("remove-btn")) return;

    const index = e.target.dataset.index;

    cart.splice(index, 1);

    localStorage.setItem("cart", JSON.stringify(cart));

    renderCart();

  });


  /* =====================
     UPDATE QUANTITY
  ===================== */

  document.addEventListener("change", (e) => {

    if (!e.target.classList.contains("qty-input")) return;

    const index = e.target.dataset.index;

    cart[index].quantity = parseInt(e.target.value) || 1;

    localStorage.setItem("cart", JSON.stringify(cart));

    renderCart();

  });

});

/* =============================
   YOU MAY ALSO LIKE PRODUCTS
============================= */

async function loadRecommendedProducts() {

  const container = document.getElementById("recommendTrack");
  if (!container) return;

  try {

    const res = await fetch("http://localhost:5000/api/products");
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
            ⭐ 4.5
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