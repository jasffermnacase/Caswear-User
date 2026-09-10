// ==========================================================
// CASWEAR - COMPLETE CART.JS
// ==========================================================


// ==========================================================
// LOAD CART WHEN PAGE OPENS
// ==========================================================

document.addEventListener("DOMContentLoaded", function () {
    displayCart();
});


// ==========================================================
// GET CART
// ==========================================================

function getCart() {

    return JSON.parse(
        localStorage.getItem("cart")
    ) || [];

}


// ==========================================================
// SAVE CART
// ==========================================================

function saveCart(cart) {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

}


// ==========================================================
// DISPLAY CART
// ==========================================================

function displayCart() {

    const cartItems =
        document.getElementById("cartItems");

    const subtotalElement =
        document.getElementById("subtotal");


    if (!cartItems) {
        return;
    }


    const cart =
        getCart();


    cartItems.innerHTML = "";


    // ======================================================
    // EMPTY CART
    // ======================================================

    if (cart.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <i class="fa-solid fa-cart-shopping"></i>

                <h2>
                    Your cart is empty
                </h2>

                <p>
                    Add some items to your cart first.
                </p>

            </div>

        `;


        if (subtotalElement) {

            subtotalElement.textContent =
                "₱ 0.00";

        }


        // ==================================================
        // ADD: SAVE ZERO SUBTOTAL
        // ==================================================

        localStorage.setItem(
            "cartSubtotal",
            "0.00"
        );


        return;

    }


    // ======================================================
    // DISPLAY ITEMS
    // ======================================================

    cart.forEach(
        function (item, index) {

            const price =
                Number(item.price) || 0;


            const quantity =
                Number(
                    item.quantity || 1
                );


            const itemTotal =
                price * quantity;


            const cartItem =
                document.createElement("div");


            cartItem.className =
                "cart-item";


            cartItem.innerHTML = `

                <div class="cart-checkbox">

                    <input
                        type="checkbox"
                        class="checkout-checkbox"
                        data-index="${index}"
                        onchange="updateSubtotal()"
                    >

                </div>


                <img
                    src="${item.image || ""}"
                    class="cart-item-image"
                    alt="${item.name || "Product"}"
                >


                <div class="cart-item-details">

                    <h3>
                        ${item.name || "Product"}
                    </h3>


                    <p>
                        ₱ ${price.toFixed(2)}
                    </p>


                    <div class="quantity-control">

                        <button
                            type="button"
                            onclick="changeQuantity(${index}, -1)"
                        >
                            −
                        </button>


                        <span>
                            ${quantity}
                        </span>


                        <button
                            type="button"
                            onclick="changeQuantity(${index}, 1)"
                        >
                            +
                        </button>

                    </div>


                    <strong class="item-total">

                        ₱ ${itemTotal.toFixed(2)}

                    </strong>

                </div>


                <button
                    type="button"
                    class="remove-cart-btn"
                    onclick="removeFromCart(${index})"
                >

                    <i class="fa-solid fa-trash"></i>

                </button>

            `;


            cartItems.appendChild(
                cartItem
            );

        }
    );


    updateSubtotal();

}


// ==========================================================
// CALCULATE SELECTED SUBTOTAL
// ==========================================================

function calculateSubtotal() {

    const cart =
        getCart();


    const checkboxes =
        document.querySelectorAll(
            ".checkout-checkbox"
        );


    let subtotal = 0;


    checkboxes.forEach(
        function (checkbox) {

            if (!checkbox.checked) {
                return;
            }


            const index =
                Number(
                    checkbox.dataset.index
                );


            const item =
                cart[index];


            if (!item) {
                return;
            }


            const price =
                Number(item.price) || 0;


            const quantity =
                Number(
                    item.quantity || 1
                );


            subtotal +=
                price * quantity;

        }
    );


    return subtotal;

}


// ==========================================================
// UPDATE SUBTOTAL
// ==========================================================

function updateSubtotal() {

    const subtotalElement =
        document.getElementById(
            "subtotal"
        );


    if (!subtotalElement) {
        return;
    }


    const subtotal =
        calculateSubtotal();


    subtotalElement.textContent =
        "₱ " +
        subtotal.toFixed(2);


    // ======================================================
    // ADD: SAVE SUBTOTAL FOR RESERVATION.JS
    // ======================================================

    localStorage.setItem(
        "cartSubtotal",
        subtotal.toFixed(2)
    );

}


// ==========================================================
// CHANGE QUANTITY
// ==========================================================

function changeQuantity(
    index,
    amount
) {

    const cart =
        getCart();


    if (!cart[index]) {
        return;
    }


    let quantity =
        Number(
            cart[index].quantity || 1
        );


    quantity += amount;


    if (quantity < 1) {
        quantity = 1;
    }


    cart[index].quantity =
        quantity;


    saveCart(
        cart
    );


    displayCart();

}


// ==========================================================
// REMOVE FROM CART
// ==========================================================

function removeFromCart(index) {

    const cart =
        getCart();


    if (!cart[index]) {
        return;
    }


    cart.splice(
        index,
        1
    );


    saveCart(
        cart
    );


    displayCart();

}


// ==========================================================
// PROCEED TO RESERVATION
// ==========================================================

function proceedReservation() {

    const cart =
        getCart();


    const checkboxes =
        document.querySelectorAll(
            ".checkout-checkbox"
        );


    const selectedItems = [];

    const selectedIndexes = [];


    // ======================================================
    // GET SELECTED ITEMS
    // ======================================================

    checkboxes.forEach(
        function (checkbox) {

            if (!checkbox.checked) {
                return;
            }


            const index =
                Number(
                    checkbox.dataset.index
                );


            const item =
                cart[index];


            if (!item) {
                return;
            }


            selectedItems.push({
                name:
                    item.name || "",

                price:
                    Number(item.price) || 0,

                quantity:
                    Number(
                        item.quantity || 1
                    ),

                image:
                    item.image || ""
            });


            selectedIndexes.push(
                index
            );

        }
    );


    // ======================================================
    // CHECK SELECTION
    // ======================================================

    if (
        selectedItems.length === 0
    ) {

        alert(
            "Please select at least one item before proceeding to reservation."
        );

        return;

    }


    // ======================================================
    // CALCULATE SUBTOTAL
    // ======================================================

    let subtotal = 0;


    selectedItems.forEach(
        function (item) {

            subtotal +=
                Number(item.price) *
                Number(item.quantity);

        }
    );


    subtotal =
        Number(
            subtotal.toFixed(2)
        );


    // ======================================================
    // SAVE SELECTED ITEMS
    // ======================================================

    localStorage.setItem(
        "reservationItems",
        JSON.stringify(
            selectedItems
        )
    );


    // ======================================================
    // SAVE SUBTOTAL
    // ======================================================

    localStorage.setItem(
        "reservationSubtotal",
        subtotal.toFixed(2)
    );


    // ======================================================
    // ADD: SAVE SUBTOTAL FOR RESERVATION.JS
    // ======================================================

    localStorage.setItem(
        "cartSubtotal",
        subtotal.toFixed(2)
    );


    // ======================================================
    // REMOVE SELECTED ITEMS FROM CART
    // ======================================================

    const remainingCart =
        cart.filter(
            function (item, index) {

                return !selectedIndexes.includes(
                    index
                );

            }
        );


    saveCart(
        remainingCart
    );


    // ======================================================
    // DEBUG
    // ======================================================

    console.log(
        "Selected items:",
        selectedItems
    );

    console.log(
        "Reservation subtotal:",
        subtotal
    );


    // ======================================================
    // GO TO RESERVATION
    // ======================================================

    window.location.href =
        "reservation.html";

}


// ==========================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ==========================================================

window.updateSubtotal =
    updateSubtotal;

window.changeQuantity =
    changeQuantity;

window.removeFromCart =
    removeFromCart;

window.proceedReservation =
    proceedReservation;


// ==========================================================
// END
// ==========================================================

console.log(
    "CASWear cart.js loaded successfully."
);