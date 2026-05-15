const hamburger = document.querySelector(".hamburger");
const navButtons = document.querySelector(".nav-buttons");
let menuOpen = false;

// navbar
if (hamburger && navButtons) {
    hamburger.addEventListener("click", () => {
        if(!menuOpen){
            navButtons.style.display = "flex";
            menuOpen = true;
        } else {
            navButtons.style.display = "none";
            menuOpen = false;
        }
    });
}


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


// Basket
const basketContainer = document.getElementById("basket-items");
const totalDisplay = document.getElementById("total-price");
const clearBtn = document.getElementById("clear-cart");

// Only run this if the basketContainer exists on the page
if (basketContainer && totalDisplay) {
    
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
        // Refresh the list
        displayBasket(); 
        CheckCartEmpty();
    };

    // Clear entire cart
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            sessionStorage.removeItem("cart");
            // Refresh UI after clearing
            displayBasket(); 
            CheckCartEmpty();
        });
    }

    // Run on page load
    displayBasket();
}

const checkoutBtn = document.getElementById("checkout-btn");

//  Only run if checkoutBtn exists
if (checkoutBtn) {
    function CheckCartEmpty(){
        const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
        
        if (cart.length === 0) {
            checkoutBtn.style.opacity = "0.5";
            checkoutBtn.style.cursor = "not-allowed";
            checkoutBtn.disabled = true;
        } else { 
            checkoutBtn.style.opacity = "1";
            checkoutBtn.style.cursor = "pointer";
            checkoutBtn.disabled = false;
            checkoutBtn.style.backgroundColor = "aqua";
            checkoutBtn.style.border = "none";
            checkoutBtn.style.padding = "10px 20px";
            checkoutBtn.style.fontWeight = "bold";
        }
    }
    CheckCartEmpty();

    checkoutBtn.addEventListener("click", () => {
        window.location.href = "pay.html";
    });
}


// Payment
const paymentBtn = document.querySelector(".payment-btn");

// Only run if paymentBtn exists
if (paymentBtn) {
    paymentBtn.addEventListener("click", async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        const cardNumber = document.querySelector(".card-number").value.replace(/\s+/g, ''); // Remove spaces
        const expMonth = parseInt(document.querySelector("select[name='Month']").value);
        const expYear = parseInt(document.querySelector("select[name='Year']").value);
        const cvv = document.querySelector(".cvv-input input").value;

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        let errors = [];

        // 16 digits and starts with 51-55 (Mastercard)
        const mastercardRegex = /^5[1-5][0-9]{14}$/;
        if (!mastercardRegex.test(cardNumber)) {
            errors.push("Invalid Mastercard number. Must be 16 digits and start with 51-55.");
        }

        // Not expired
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            errors.push("The card has expired.");
        }

        // CVV 3 or 4 digits
        if (cvv.length < 3 || cvv.length > 4 || isNaN(cvv)) {
            errors.push("CVV must be 3 or 4 digits.");
        }

        // If fails
        if (errors.length > 0) {
            alert("Validation Errors:\n" + errors.join("\n"));
            return;
        }

        const paymentData = {
            master_card: parseInt(cardNumber),
            exp_year: expYear,
            exp_month: expMonth,
            cvv_code: cvv
        };

        // Send POST Request
        try {
            const response = await fetch("https://mudfoot.doc.stu.mmu.ac.uk/node/api/creditcard", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentData)
            });

            // Server responce
            const result = await response.json();

            if (response.status === 200) {
                alert(result.message);
                sessionStorage.removeItem("cart"); // Clear basket after payment
                window.location.href = "index.html"; // Send them home
            } else {
                alert("Server Error: " + (result.message || "Invalid data submitted."));
            }
        } catch (error) {
            // Network error
            alert("Could not connect to the payment server. Please try again later.");
            console.error("Fetch error:", error);
        }
    });
}