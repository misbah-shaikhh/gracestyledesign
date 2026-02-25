// Homepage hero slider 
const track = document.querySelector(".slide-track");
const slides = document.querySelectorAll(".slide");
let index = 0;
let autoSlideInterval;

// update slide position
function updateSlide() {
  track.style.transform = `translateX(-${index * 100}%)`;
}

// next slide
function nextSlide() {
  index = (index + 1) % slides.length;
  updateSlide();
  resetAutoSlide();
}

// previous slide
function prevSlide() {
  index = (index - 1 + slides.length) % slides.length;
  updateSlide();
  resetAutoSlide();
}

// auto slide function
function startAutoSlide() {
  autoSlideInterval = setInterval(nextSlide, 6000); // slower & smooth
}

// reset auto slide when user clicks arrows
function resetAutoSlide() {
  clearInterval(autoSlideInterval);
  startAutoSlide();
}

// start slider initially
startAutoSlide();

function scrollProducts(direction) {
  const track = document.querySelector(".product-track");

  const cardWidth = 443;   // your card width
  const gap = 56;          // space between cards
  const scrollAmount = cardWidth + gap;

  track.scrollBy({
    left: direction * scrollAmount,
    behavior: "smooth"
  });
}

// range filter 
const range = document.getElementById("priceRange");
const priceValue = document.getElementById("priceValue");

function updateRange() {
  const min = range.min;
  const max = range.max;
  const value = range.value;
  const percent = ((value - min) / (max - min)) * 100;

  // Update slider color
  range.style.background = `linear-gradient(
    to right,
    #6b2f1a 0%,
    #6b2f1a ${percent}%,
    #fff ${percent}%,
    #fff 100%
  )`;

  // Update text
  priceValue.innerText = Number(value).toLocaleString();
}

range.addEventListener("input", updateRange);
updateRange(); // initial load
