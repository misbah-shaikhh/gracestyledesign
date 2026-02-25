const methodOverlay = document.getElementById("methodOverlay");
const methodBox = document.getElementById("methodBox");

const placeOrderBtn = document.querySelector(".place-order-btn");
const nextBtn = document.querySelector(".next-btn");
const closeMethodOverlay = document.getElementById("closeMethodOverlay");

const addressOverlay = document.getElementById("addressOverlay");
const cancelOverlay = document.getElementById("cancelOverlay");
const saveBtn = document.querySelector(".save-btn");

/* -------------------- */
/* OPEN METHOD OVERLAY */
/* -------------------- */

function openMethodOverlay() {
  methodOverlay.style.display = "flex";
}

if (placeOrderBtn) placeOrderBtn.addEventListener("click", openMethodOverlay);
if (nextBtn) nextBtn.addEventListener("click", openMethodOverlay);

/* CLOSE METHOD WITH CANCEL */
if (closeMethodOverlay) {
  closeMethodOverlay.addEventListener("click", function () {
    methodOverlay.style.display = "none";
  });
}

/* CLOSE METHOD WHEN CLICKING OUTSIDE */
methodOverlay.addEventListener("click", function (e) {
  if (!methodBox.contains(e.target)) {
    methodOverlay.style.display = "none";
  }
});

/* -------------------------------- */
/* OPEN ADDRESS OVERLAY (FROM METHOD) */
/* -------------------------------- */

document.addEventListener("click", function (e) {

  if (
    e.target.classList.contains("edit-btn") ||
    e.target.classList.contains("add-btn")
  ) {

    // Close method overlay
    methodOverlay.style.display = "none";

    // Open address overlay
    addressOverlay.style.display = "flex";
  }

});

/* -------------------------------- */
/* CANCEL ADDRESS OVERLAY */
/* -------------------------------- */

if (cancelOverlay) {
  cancelOverlay.addEventListener("click", function () {

    addressOverlay.style.display = "none";

    // Reopen method overlay
    methodOverlay.style.display = "flex";
  });
}

/* CLOSE ADDRESS WHEN CLICKING OUTSIDE */
addressOverlay.addEventListener("click", function (e) {
  const box = addressOverlay.querySelector(".overlay-box");

  if (!box.contains(e.target)) {

    addressOverlay.style.display = "none";

    // Reopen method overlay
    methodOverlay.style.display = "flex";
  }
});

/* -------------------------------- */
/* SAVE ADDRESS */
/* -------------------------------- */

if (saveBtn) {
  saveBtn.addEventListener("click", function () {

    addressOverlay.style.display = "none";

    // Reopen method overlay
    methodOverlay.style.display = "flex";

    showTopMessage("Address Added. Place Order");
  });
}

/* -------------------------------- */
/* TOP MESSAGE FUNCTION */
/* -------------------------------- */

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