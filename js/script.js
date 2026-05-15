const hamburger = document.querySelector(".hamburger");
const navButtons = document.querySelector(".nav-buttons");
let menuOpen = false;

hamburger.addEventListener("click", () => {
    if(!menuOpen){
        navButtons.style.display = "flex";
        menuOpen = true;
    }
    else{
        navButtons.style.display = "none";
        menuOpen = false;
    }
})



const bookInfos = document.querySelectorAll(".book-info");

bookInfos.forEach(container => {
    const text = container.querySelector(".book-text");
    const btn = container.querySelector(".show-more-btn");

    if (!text || !btn) return;
    if (text.scrollHeight > text.clientHeight) {
        btn.style.display = "inline-block";
        
        btn.addEventListener("click", () => {
            text.classList.toggle("expanded");
            
            if (text.classList.contains("expanded")) {
                btn.textContent = "Show Less";
            } else {
                btn.textContent = "Show More";
                container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }
});



const addButtons = document.querySelectorAll(".add-btn");

addButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const book = {
            title: btn.getAttribute("data-title"),
            price: parseFloat(btn.getAttribute("data-price")),
            image: btn.getAttribute("data-img")
        };

        let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        cart.push(book);
        sessionStorage.setItem("cart", JSON.stringify(cart));

        alert(`${book.title} added to basket!`);
    });
});



const basketContainer = document.getElementById("basket-items");
const totalDisplay = document.getElementById("total-price");
const clearBtn = document.getElementById("clear-cart");

function displayBasket() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    basketContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
        basketContainer.innerHTML = "<p>Your basket is currently empty.</p>";
    } else {
        cart.forEach((item, index) => {
            total += item.price;

            const itemDiv = document.createElement("div");
            itemDiv.classList.add("basket-item");

            itemDiv.innerHTML = `
                <img class="checkout-img" 
                    src="${item.image}" 
                    alt="${item.title}">

                <div class="basket-details">
                    <h4>${item.title}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>

                <button class="remove-btn">Remove</button>
            `;

        itemDiv.querySelector(".remove-btn")
            .addEventListener("click", () => {
                removeItem(index);
            });

        basketContainer.appendChild(itemDiv);
        });
    }
    totalDisplay.textContent = total.toFixed(2);
}

// remove a single item
window.removeItem = (index) => {
    let cart = JSON.parse(sessionStorage.getItem("cart"));
    cart.splice(index, 1); // Remove item at that position
    sessionStorage.setItem("cart", JSON.stringify(cart));
    displayBasket(); // Refresh the list
};

// Clear entire cart
clearBtn.addEventListener("click", () => {
    sessionStorage.removeItem("cart");
    displayBasket();
});

displayBasket();

const checkoutBtn = document.getElementById("checkout-btn");
const paymentBtn = document.getElementById("payment-btn");

const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
if (cart.length === 0) {
    checkoutBtn.style.opacity = "0.5";
    checkoutBtn.style.cursor = "not-allowed";
    checkoutBtn.disabled = true;
} else {
    checkoutBtn.style.opacity = "1";
    checkoutBtn.style.cursor = "pointer";
    checkoutBtn.disabled = false;
}

checkoutBtn.addEventListener("click", () => {
    window.location.href = "pay.html";
});
