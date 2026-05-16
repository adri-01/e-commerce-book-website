const hamburger = document.querySelector(".hamburger");
const navButtons = document.querySelector(".nav-buttons");
let menuOpen = false;

// navbar
if (hamburger && navButtons) {
    hamburger.addEventListener("click", () => {
        if (!menuOpen) {
            navButtons.style.display = "flex";
            menuOpen = true;
        } else {
            navButtons.style.display = "none";
            menuOpen = false;
        }
    });
}

// Update basket count
function updateBasketCount() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const itemCount = cart.length;

    const basketIcon = document.querySelector("#basket-icon");

    if (basketIcon) {
        basketIcon.setAttribute("data-count", itemCount);

        basketIcon.textContent = itemCount;
    }
}

// Home page
window.addEventListener("load", () => { // On page load
    updateBasketCount();

    const bookInfos = document.querySelectorAll(".book-info");

    bookInfos.forEach(container => {
        const text = container.querySelector(".book-text");
        const btn = container.querySelector(".show-more-btn");

        if (!text || !btn) return;

        if (text.scrollHeight > text.clientHeight + 1) {
            btn.style.display = "flex";
            btn.style.justifyContent = "flex-end";
                btn.style.marginTop = "0px";

                btn.addEventListener("click", () => {
                    text.classList.toggle("expanded");

                    if (text.classList.contains("expanded")) {
                        btn.textContent = "Show Less";
                    } else {
                        btn.textContent = "Show More";

                        container.scrollIntoView({
                            behavior: "smooth",
                            block: "nearest"
                        });
                    }
                });
         } else {
             btn.style.display = "none";
        }
    });
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

        updateBasketCount();

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
        

        if (cart.length === 0) {
            basketContainer.innerHTML = "<p>Your basket is currently empty.</p>";
        } else {
            cart.forEach((item, index) => {
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

                    <button class="remove-btn">x Remove x</button>
                `;

            itemDiv.querySelector(".remove-btn")
                .addEventListener("click", () => {
                    removeItem(index);
                });

            basketContainer.appendChild(itemDiv);
            });
        }
        totalDisplay.textContent = calculateTotal().toFixed(2);
    }

    // remove a single item
    window.removeItem = (index) => {
        let cart = JSON.parse(sessionStorage.getItem("cart"));
        cart.splice(index, 1); // Remove item at that position
        sessionStorage.setItem("cart", JSON.stringify(cart));
        // Refresh the list
        displayBasket(); 
        updateBasketCount();
        CheckCartEmpty();
    };

    // Clear entire cart
    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            sessionStorage.removeItem("cart");
            // Refresh UI after clearing
            displayBasket(); 
            updateBasketCount();
            CheckCartEmpty();
        });
    }

    // Run on page load
    displayBasket();
}


function calculateTotal() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    // Use reduce to sum up prices, or a simple loop that resets to 0
    let currentTotal = 0;
    cart.forEach(item => {
        currentTotal += item.price;
    });
    return currentTotal;
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
    const totalDisplay = document.getElementById("total-price");
    let total = calculateTotal().toFixed(2)
    totalDisplay.textContent = total;

    // payment input restriction
    const cardInput = document.querySelector(".card-number");
    const cvvInput = document.querySelector(".cvv-input input");

    if (cardInput) {
        cardInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, "");// Remove all non-digits

            if (value.length > 16) {
                value = value.slice(0, 16); //Limit to 16 digits
            }
            const formattedValue = value.match(/.{1,4}/g)?.join(" ") || ""; // Add space every 4 digits
            e.target.value = formattedValue;
        });
    }

    if (cvvInput) {
        cvvInput.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, ""); // Remove all non-digits
            if (value.length > 4) {
                value = value.slice(0, 4); // Limit to 4 digits
            }

            e.target.value = value;
        });
    }

    

    // payment input validation
    paymentBtn.addEventListener("click", async (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        const cardNumber = document.querySelector(".card-number").value.replace(/\s+/g, ''); // Remove spaces
        const expMonth = parseInt(document.querySelector("select[name='Month']").value);
        const expYear = parseInt(document.querySelector("select[name='Year']").value);
        const cvv = document.querySelector(".cvv-input input").value;

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();


        const cardError = document.getElementById("card-error");
        const dateError = document.getElementById("date-error");
        const cvvError = document.getElementById("cvv-error");

        // Clear all previous errors every time continue button is pressed
        cardError.textContent = "";
        dateError.textContent = "";
        cvvError.textContent = "";

        let hasError = false; 

        // card number must be 16 digits and starts with 51-55
        const mastercardRegex = /^5[1-5][0-9]{14}$/;
        if (!mastercardRegex.test(cardNumber)) {
            cardError.textContent = "Invalid Mastercard number. Must be 16 digits and start with 51-55.";
            hasError = true;
        }

        // Date Validation 
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
            dateError.textContent = "The card has expired.";
            hasError = true;
        }

        // CVV Validation (3 or 4 digits)
        if (cvv.length < 3 || cvv.length > 4 || isNaN(cvv)) {
            cvvError.textContent = "CVV must be 3 or 4 digits.";
            hasError = true;
        }

        // return if there is an error
        if (hasError) {
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
                const paymentInfo = {
                    cardNumber: "**** **** **** " + cardNumber.slice(-4),
                    total: total,
                    date: now.getDate() + "/" + (now.getMonth() + 1) + "/" + now.getFullYear(),
                    time: now.getHours() + ":" + now.getMinutes()
                };
                sessionStorage.setItem("paymentInfo", JSON.stringify(paymentInfo));
                sessionStorage.removeItem("cart"); // Clear basket after payment
                updateBasketCount();
                window.location.href = "success.html"; // Send to confirmation page
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

// Success page
const paymentInfo = JSON.parse(sessionStorage.getItem("paymentInfo"));

if (paymentInfo) {
    document.querySelector(".card-number").textContent = paymentInfo.cardNumber;
    document.querySelector(".date").textContent = paymentInfo.date;
    document.querySelector(".time").textContent = paymentInfo.time;
    document.querySelector(".total").textContent = paymentInfo.total;
}