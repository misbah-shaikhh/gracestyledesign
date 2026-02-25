

// Add to cart badge click functionality
const saleBadges = document.querySelectorAll('.sale-badge');

saleBadges.forEach(badge => {
    badge.addEventListener('click', function () {
        alert('Item added to cart!');
    });
});


        // Thumbnail Image Gallery
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('mainImage');

        thumbnails.forEach((thumbnail) => {
            thumbnail.addEventListener('click', function() {
                thumbnails.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                mainImage.src = this.querySelector('img').src.replace('w=200&h=300', 'w=800&h=1000');
            });
        });

        // Size Selection
        const sizeButtons = document.querySelectorAll('.size-btn');
        sizeButtons.forEach((btn) => {
            btn.addEventListener('click', function() {
                sizeButtons.forEach(b => b.style.opacity = '0.7');
                this.style.opacity = '1';
            });
        });

        // Color Selection
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(color => {
            color.addEventListener('click', function() {
                colorOptions.forEach(c => c.classList.remove('active'));
                this.classList.add('active');
                
                // Update color name
                const colorName = this.classList.contains('beige') ? 'Beige' :
                                 this.classList.contains('cream') ? 'Cream' :
                                 this.classList.contains('lavender') ? 'Lavender' : 'Yellow';
                document.querySelector('.color-name').textContent = colorName;
            });
        });

        // Wishlist Toggle
        const wishlistBtns = document.querySelectorAll('.wishlist-btn');
        wishlistBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const icon = this.querySelector('i');
                if (icon.classList.contains('far')) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                }
            });
        });
    
