document.addEventListener('DOMContentLoaded', () => {
    loadSection('home');
});

const loadSection = async (section) => {
    if (section === 'home') {
        loadHomePage();
    } else if (section === 'products') {
        await loadProductsPage();
    } else if (section === 'cart') {
        await loadCartPage();
    }
};

const loadHomePage = () => {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = `
        <section class="hero">
            <div class="hero-content">
                <h2>Discover the Joy of Play</h2>
                <p>Explore our wide range of toys for all ages</p>
                <a href="#" onclick="loadSection('products')" class="cta-button">Shop Now</a>
            </div>
        </section>
        <section class="featured-products">
            <h2>Featured Products</h2>
            <div id="featured-product-list"></div>
        </section>
        <section class="testimonials">
            <h2>What Our Customers Say</h2>
            <div class="testimonial">
                <p>"Great quality toys and excellent customer service!" - Jane Doe</p>
            </div>
            <div class="testimonial">
                <p>"My kids love the toys from Play Toys!" - John Smith</p>
            </div>
        </section>
    `;
    loadFeaturedProducts();
};

const loadFeaturedProducts = async () => {
    try {
        const response = await fetch('data/products.json');
        const products = await response.json();
        const featuredProductList = document.getElementById('featured-product-list');
        featuredProductList.innerHTML = '';

        products.slice(0, 3).forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>Price: $${product.price.toFixed(2)}</p>
                <a href="#" onclick="loadSection('products')" class="cta-button">View Product</a>
            `;
            featuredProductList.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Failed to load featured products:', error);
    }
};

const loadProductsPage = async () => {
    try {
        const response = await fetch('data/products.xml');
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const products = xml.getElementsByTagName('product');

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '<h2>Products</h2>';

		const h2Element = mainContent.querySelector('h2');
		if (h2Element) {
			h2Element.style.textAlign = center;
		} 
		
        Array.from(products).forEach(product => {
            const id = product.getElementsByTagName('id')[0].textContent;
            const name = product.getElementsByTagName('name')[0].textContent;
            const price = parseFloat(product.getElementsByTagName('price')[0].textContent);
            const image = product.getElementsByTagName('image')[0].textContent;

            const productDiv = document.createElement('div');
            productDiv.classList.add('product');
            productDiv.innerHTML = `
                <img src="${image}" alt="${name}">
                <h3>${name}</h3>
                <p>Price: $${price.toFixed(2)}</p>
                <button class="cta-button" onclick="addToCart(${id})">Add to Cart</button>
            `;
            mainContent.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Failed to load products:', error);
    }
};

const addToCart = (productId) => {
    console.log(`Adding product ID: ${productId} to cart`);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex > -1) {
        cart[productIndex].quantity += 1;
        console.log(`Product already in cart. New quantity: ${cart[productIndex].quantity}`);
    } else {
        cart.push({ id: productId, quantity: 1 });
        console.log(`Product added to cart with ID: ${productId}`);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    alert('Product added to cart. Check cart for more details.');
    console.log('Cart:', cart);
};

const loadCartPage = async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const response = await fetch('data/products.xml');
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'application/xml');
    const products = xml.getElementsByTagName('product');

    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<h2>Cart</h2>';
	
	const h2Element = mainContent.querySelector('h2');
	if (h2Element) {
		h2Element.style.textAlign = center;
	}

    if (cart.length === 0) {
        mainContent.innerHTML += '<p>Your cart is empty.</p>';
        return;
    }

    let total = 0;
    cart.forEach(cartItem => {
        const product = Array.from(products).find(p => p.getElementsByTagName('id')[0].textContent == cartItem.id);
        const name = product.getElementsByTagName('name')[0].textContent;
        const price = parseFloat(product.getElementsByTagName('price')[0].textContent);
        const itemTotal = price * cartItem.quantity;
        total += itemTotal;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
            <h3>${name}</h3>
            <p>Quantity: ${cartItem.quantity}</p>
            <p>Price: $${itemTotal.toFixed(2)}</p>
        `;
        mainContent.appendChild(cartItemDiv);
    });

    const tax = total * 0.1; // 10% tax
    const grandTotal = total + tax;

    const totalDiv = document.createElement('div');
    totalDiv.classList.add('cart-total');
    totalDiv.innerHTML = `
        <h3>Total: $${total.toFixed(2)}</h3>
        <h3>Tax: $${tax.toFixed(2)}</h3>
        <h3>Grand Total: $${grandTotal.toFixed(2)}</h3>
    `;
    mainContent.appendChild(totalDiv);
};
