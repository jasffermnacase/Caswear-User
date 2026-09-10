import {
    getApps,
    getApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    onSnapshot,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


// ==========================================================
// START MESSAGE
// ==========================================================

console.log("=================================");
console.log("CASWEAR PRODUCT.JS LOADED");
console.log("=================================");


// ==========================================================
// FIREBASE APP
// ==========================================================

let app = null;

function getFirebaseApp() {

    try {

        if (getApps().length > 0) {
            return getApp();
        }

    } catch (error) {

        console.error(
            "Firebase app error:",
            error
        );

    }

    return null;
}

app = getFirebaseApp();


// ==========================================================
// FIRESTORE / AUTH
// ==========================================================

const db = app
    ? getFirestore(app)
    : null;

const auth = app
    ? getAuth(app)
    : null;


// ==========================================================
// PRODUCTS CONTAINER
// ==========================================================

const productsContainer =
    document.getElementById(
        "productsContainer"
    );

if (!productsContainer) {

    console.error(
        "#productsContainer was not found."
    );

}


// ==========================================================
// PROGRAM NORMALIZATION
// ==========================================================

function normalizeProgram(value) {

    if (!value) {
        return "";
    }

    const program = String(value)
        .trim()
        .toUpperCase()
        .replace(/\./g, "")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ");


    // ------------------------------------------------------
    // INFORMATION SYSTEMS
    // ------------------------------------------------------

    if (
        program === "IS" ||
        program === "BSIS" ||
        program === "BS IS" ||
        program === "INFORMATION SYSTEMS" ||
        program ===
        "BACHELOR OF SCIENCE IN INFORMATION SYSTEMS"
    ) {

        return "IS";

    }


    // ------------------------------------------------------
    // INFORMATION TECHNOLOGY
    // ------------------------------------------------------

    if (
        program === "IT" ||
        program === "BSIT" ||
        program === "BS IT" ||
        program === "INFORMATION TECHNOLOGY" ||
        program ===
        "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY"
    ) {

        return "IT";

    }


    // ------------------------------------------------------
    // STATISTICS
    // ------------------------------------------------------

    if (
        program === "STAT" ||
        program === "BSSTAT" ||
        program === "BS STAT" ||
        program === "STATISTICS" ||
        program ===
        "BACHELOR OF SCIENCE IN STATISTICS"
    ) {

        return "STAT";

    }


    // ------------------------------------------------------
    // PSYCHOLOGY
    // ------------------------------------------------------

    if (
        program === "PSYCH" ||
        program === "BSPYCH" ||
        program === "BSPSYCH" ||
        program === "BS PSYCH" ||
        program === "PSYCHOLOGY" ||
        program ===
        "BACHELOR OF SCIENCE IN PSYCHOLOGY"
    ) {

        return "PSYCH";

    }


    // ------------------------------------------------------
    // PROVINCIAL
    // ------------------------------------------------------

    if (
        program === "PROV" ||
        program === "PROVINCE" ||
        program === "PROVINCIAL"
    ) {

        return "PROVINCIAL";

    }


    // ------------------------------------------------------
    // ALL
    // ------------------------------------------------------

    if (
        program === "ALL" ||
        program === "ALL PROGRAMS"
    ) {

        return "";

    }


    return program;

}


// ==========================================================
// GET PRODUCT PROGRAMS
// ==========================================================

function getProductPrograms(product) {

    const values = [];


    if (product.program) {

        values.push(
            product.program
        );

    }


    if (product.assignedProgram) {

        values.push(
            product.assignedProgram
        );

    }


    if (Array.isArray(product.programs)) {

        values.push(
            ...product.programs
        );

    }


    if (
        Array.isArray(
            product.assignedPrograms
        )
    ) {

        values.push(
            ...product.assignedPrograms
        );

    }


    const programs = [];


    values.forEach(
        value => {

            // ------------------------------------------------
            // ARRAY
            // ------------------------------------------------

            if (Array.isArray(value)) {

                value.forEach(
                    item => {

                        const normalized =
                            normalizeProgram(
                                item
                            );

                        if (
                            normalized &&
                            !programs.includes(
                                normalized
                            )
                        ) {

                            programs.push(
                                normalized
                            );

                        }

                    }
                );

                return;

            }


            // ------------------------------------------------
            // STRING
            // ------------------------------------------------

            if (
                typeof value === "string"
            ) {

                value
                    .split(",")
                    .forEach(
                        item => {

                            const normalized =
                                normalizeProgram(
                                    item
                                );

                            if (
                                normalized &&
                                !programs.includes(
                                    normalized
                                )
                            ) {

                                programs.push(
                                    normalized
                                );

                            }

                        }
                    );

                return;

            }


            // ------------------------------------------------
            // OTHER VALUE
            // ------------------------------------------------

            const normalized =
                normalizeProgram(
                    value
                );

            if (
                normalized &&
                !programs.includes(
                    normalized
                )
            ) {

                programs.push(
                    normalized
                );

            }

        }
    );


    return programs;

}


// ==========================================================
// ESCAPE HTML
// ==========================================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ==========================================================
// GET STOCK
// ==========================================================

function getProductStock(product) {

    const possibleStockValues = [

        product.stock,
        product.quantity,
        product.availableStock,
        product.inventory

    ];


    for (
        const value of possibleStockValues
    ) {

        if (
            value !== undefined &&
            value !== null &&
            value !== ""
        ) {

            const number =
                Number(value);

            if (
                !Number.isNaN(number)
            ) {

                return number;

            }

        }

    }


    // ------------------------------------------------------
    // If no stock field exists, treat as unlimited
    // ------------------------------------------------------

    return null;

}


// ==========================================================
// CHECK IF PRODUCT REQUIRES SIZE
// ==========================================================

function requiresSize(product) {

    const name = String(
        product.name ||
        product.productName ||
        ""
    ).toLowerCase();


    const category = String(
        product.category ||
        product.productCategory ||
        ""
    ).toLowerCase();


    const type = String(
        product.type ||
        product.productType ||
        ""
    ).toLowerCase();


    const combined =
        `${name} ${category} ${type}`;


    // ------------------------------------------------------
    // T-SHIRT / SHIRT DETECTION
    // ------------------------------------------------------

    return (
        combined.includes("t-shirt") ||
        combined.includes("tshirt") ||
        combined.includes("t shirt") ||
        combined.includes("shirt")
    );

}


// ==========================================================
// CHECK IF PRODUCT IS LANYARD
// ==========================================================

function isLanyard(product) {

    const name = String(
        product.name ||
        product.productName ||
        ""
    ).toLowerCase();


    const category = String(
        product.category ||
        product.productCategory ||
        ""
    ).toLowerCase();


    return (
        name.includes("lanyard") ||
        category.includes("lanyard")
    );

}


// ==========================================================
// GET PAGE PROGRAM
// ==========================================================

function getPageProgram() {

    const rawProgram =
        document.body.dataset.program ||
        "";


    const program =
        normalizeProgram(
            rawProgram
        );


    console.log(
        "PAGE PROGRAM:",
        rawProgram
    );


    console.log(
        "NORMALIZED PROGRAM:",
        program
    );


    return program;

}


// ==========================================================
// GET USER PROGRAM
// ==========================================================

async function getUserProgram(user) {

    if (!user) {
        return "";
    }


    try {

        const userRef =
            doc(
                db,
                "users",
                user.uid
            );


        const userSnapshot =
            await getDoc(
                userRef
            );


        if (
            !userSnapshot.exists()
        ) {

            console.log(
                "User document not found."
            );

            return "";

        }


        const userData =
            userSnapshot.data();


        console.log(
            "USER DATA:",
            userData
        );


        const possiblePrograms = [

            userData.program,
            userData.Program,
            userData.course,
            userData.courseProgram,
            userData.assignedProgram

        ];


        for (
            const value
            of possiblePrograms
        ) {

            if (value) {

                const normalized =
                    normalizeProgram(
                        value
                    );


                if (normalized) {

                    console.log(
                        "USER PROGRAM:",
                        normalized
                    );


                    return normalized;

                }

            }

        }


        return "";

    } catch (error) {

        console.error(
            "ERROR GETTING USER PROGRAM:",
            error
        );


        return "";

    }

}


// ==========================================================
// ADD TO LOCAL STORAGE CART
// ==========================================================

function addProductToCart(
    product,
    productId,
    selectedSize = ""
) {

    // ------------------------------------------------------
    // GET EXISTING CART
    // ------------------------------------------------------

    let cart = [];

    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "cart"
                )
            ) || [];

    } catch (error) {

        console.error(
            "Error reading cart:",
            error
        );

        cart = [];

    }


    // ------------------------------------------------------
    // PRODUCT INFORMATION
    // ------------------------------------------------------

    const name =
        product.name ||
        product.productName ||
        "Unnamed Product";


    const price =
        product.price !== undefined &&
        product.price !== null
            ? Number(product.price)
            : 0;


    const image =
        product.image ||
        product.imageUrl ||
        "";


    const category =
        product.category ||
        product.productCategory ||
        "Apparel";


    const stock =
        getProductStock(
            product
        );


    // ------------------------------------------------------
    // CHECK STOCK
    // ------------------------------------------------------

    if (
        stock !== null &&
        stock <= 0
    ) {

        alert(
            `${name} is currently out of stock.`
        );

        return false;

    }


    // ------------------------------------------------------
    // FIND EXISTING ITEM
    //
    // Same product + same size = increase quantity
    // ------------------------------------------------------

    const existingIndex =
        cart.findIndex(
            item => {

                const sameProduct =
                    String(
                        item.productId || ""
                    ) ===
                    String(productId);


                const existingSize =
                    String(
                        item.size || ""
                    ).toUpperCase();


                const newSize =
                    String(
                        selectedSize || ""
                    ).toUpperCase();


                return (
                    sameProduct &&
                    existingSize === newSize
                );

            }
        );


    // ------------------------------------------------------
    // EXISTING ITEM
    // ------------------------------------------------------

    if (
        existingIndex !== -1
    ) {

        const currentQuantity =
            Number(
                cart[existingIndex].quantity ||
                1
            );


        const newQuantity =
            currentQuantity + 1;


        // --------------------------------------------------
        // STOCK LIMIT
        // --------------------------------------------------

        if (
            stock !== null &&
            newQuantity > stock
        ) {

            alert(
                `Only ${stock} ${stock === 1 ? "item is" : "items are"} available.`
            );

            return false;

        }


        cart[existingIndex].quantity =
            newQuantity;


        saveCart(cart);


        showCartMessage(
            `${name} quantity updated in cart.`
        );


        updateCartCount();


        return true;

    }


    // ------------------------------------------------------
    // NEW CART ITEM
    // ------------------------------------------------------

    const cartItem = {

        productId:
            productId,

        name:
            name,

        price:
            price,

        image:
            image,

        category:
            category,

        size:
            selectedSize || "",

        quantity:
            1

    };


    cart.push(
        cartItem
    );


    saveCart(
        cart
    );


    showCartMessage(
        `${name} added to cart.`
    );


    updateCartCount();


    console.log(
        "ADDED TO CART:",
        cartItem
    );


    return true;

}


// ==========================================================
// SAVE CART
// ==========================================================

function saveCart(cart) {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    console.log(
        "CART SAVED:",
        cart
    );

}


// ==========================================================
// UPDATE CART COUNT
// ==========================================================

function updateCartCount() {

    const cartCountElements =
        document.querySelectorAll(
            "#cartCount, .cart-count"
        );


    let cart = [];


    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "cart"
                )
            ) || [];

    } catch (error) {

        cart = [];

    }


    const count =
        cart.reduce(
            (total, item) => {

                return total +
                    Number(
                        item.quantity || 1
                    );

            },
            0
        );


    cartCountElements.forEach(
        element => {

            element.textContent =
                count;

        }
    );

}


// ==========================================================
// CART MESSAGE
// ==========================================================

function showCartMessage(message) {

    // ------------------------------------------------------
    // Remove old message
    // ------------------------------------------------------

    const oldMessage =
        document.getElementById(
            "caswearCartMessage"
        );


    if (oldMessage) {

        oldMessage.remove();

    }


    // ------------------------------------------------------
    // Create message
    // ------------------------------------------------------

    const messageBox =
        document.createElement(
            "div"
        );


    messageBox.id =
        "caswearCartMessage";


    messageBox.textContent =
        message;


    // ------------------------------------------------------
    // Basic inline styling
    // ------------------------------------------------------

    messageBox.style.position =
        "fixed";

    messageBox.style.bottom =
        "30px";

    messageBox.style.right =
        "30px";

    messageBox.style.zIndex =
        "99999";

    messageBox.style.background =
        "#3d1700";

    messageBox.style.color =
        "#ffffff";

    messageBox.style.padding =
        "15px 22px";

    messageBox.style.borderRadius =
        "10px";

    messageBox.style.fontFamily =
        "Arial, sans-serif";

    messageBox.style.fontSize =
        "15px";

    messageBox.style.boxShadow =
        "0 5px 20px rgba(0,0,0,0.2)";


    document.body.appendChild(
        messageBox
    );


    // ------------------------------------------------------
    // Remove after 2 seconds
    // ------------------------------------------------------

    setTimeout(
        function () {

            if (messageBox) {

                messageBox.remove();

            }

        },
        2000
    );

}


// ==========================================================
// SIZE MODAL
// ==========================================================

function showSizeModal(
    product,
    productId
) {

    // ------------------------------------------------------
    // Remove existing modal
    // ------------------------------------------------------

    const oldModal =
        document.getElementById(
            "caswearSizeModal"
        );


    if (oldModal) {

        oldModal.remove();

    }


    // ------------------------------------------------------
    // Product information
    // ------------------------------------------------------

    const name =
        product.name ||
        product.productName ||
        "Product";


    const price =
        product.price !== undefined &&
        product.price !== null
            ? Number(product.price)
            : 0;


    const image =
        product.image ||
        product.imageUrl ||
        "";


    // ------------------------------------------------------
    // Create modal
    // ------------------------------------------------------

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "caswearSizeModal";


    modal.innerHTML = `

        <div class="caswear-modal-overlay">

            <div class="caswear-size-modal">

                <button
                    type="button"
                    class="caswear-modal-close"
                    id="caswearCloseSizeModal">

                    &times;

                </button>


                ${
                    image
                        ? `
                            <img
                                src="${escapeHtml(image)}"
                                alt="${escapeHtml(name)}"
                                class="caswear-modal-product-image"
                                onerror="this.style.display='none';"
                            >
                          `
                        : ""
                }


                <h2>
                    Select Size
                </h2>


                <p class="caswear-modal-product-name">
                    ${escapeHtml(name)}
                </p>


                <p class="caswear-modal-price">
                    ₱${price.toFixed(2)}
                </p>


                <div class="caswear-size-options">

                    <button
                        type="button"
                        class="caswear-size-option"
                        data-size="XS">
                        XS
                    </button>

                    <button
                        type="button"
                        class="caswear-size-option"
                        data-size="S">
                        S
                    </button>

                    <button
                        type="button"
                        class="caswear-size-option"
                        data-size="M">
                        M
                    </button>

                    <button
                        type="button"
                        class="caswear-size-option"
                        data-size="L">
                        L
                    </button>

                    <button
                        type="button"
                        class="caswear-size-option"
                        data-size="XL">
                        XL
                    </button>

                </div>


                <p
                    id="caswearSelectedSize"
                    class="caswear-selected-size">

                    Please select a size.

                </p>


                <button
                    type="button"
                    id="caswearAddSizeToCart"
                    class="caswear-add-cart-button">

                    <i class="fa-solid fa-cart-plus"></i>

                    Add to Cart

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    // ------------------------------------------------------
    // Add modal styles
    // ------------------------------------------------------

    addModalStyles();


    // ------------------------------------------------------
    // Selected size
    // ------------------------------------------------------

    let selectedSize = "";


    const sizeButtons =
        modal.querySelectorAll(
            ".caswear-size-option"
        );


    const selectedSizeText =
        modal.querySelector(
            "#caswearSelectedSize"
        );


    sizeButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    // --------------------------------------
                    // Remove selected state
                    // --------------------------------------

                    sizeButtons.forEach(
                        item => {

                            item.classList.remove(
                                "selected"
                            );

                        }
                    );


                    // --------------------------------------
                    // Select current
                    // --------------------------------------

                    this.classList.add(
                        "selected"
                    );


                    selectedSize =
                        this.dataset.size;


                    selectedSizeText.textContent =
                        `Selected size: ${selectedSize}`;

                }
            );

        }
    );


    // ------------------------------------------------------
    // Close button
    // ------------------------------------------------------

    const closeButton =
        modal.querySelector(
            "#caswearCloseSizeModal"
        );


    closeButton.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


    // ------------------------------------------------------
    // Click outside modal
    // ------------------------------------------------------

    const overlay =
        modal.querySelector(
            ".caswear-modal-overlay"
        );


    overlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target === overlay
            ) {

                modal.remove();

            }

        }
    );


    // ------------------------------------------------------
    // Add to cart
    // ------------------------------------------------------

    const addButton =
        modal.querySelector(
            "#caswearAddSizeToCart"
        );


    addButton.addEventListener(
        "click",
        function () {

            if (!selectedSize) {

                alert(
                    "Please select a size first."
                );

                return;

            }


            const added =
                addProductToCart(
                    product,
                    productId,
                    selectedSize
                );


            if (added) {

                modal.remove();

            }

        }
    );

}


// ==========================================================
// DIRECT ADD-TO-CART MODAL
// ==========================================================

function showAddToCartModal(
    product,
    productId
) {

    // ------------------------------------------------------
    // Remove existing modal
    // ------------------------------------------------------

    const oldModal =
        document.getElementById(
            "caswearCartModal"
        );


    if (oldModal) {

        oldModal.remove();

    }


    const name =
        product.name ||
        product.productName ||
        "Product";


    const price =
        product.price !== undefined &&
        product.price !== null
            ? Number(product.price)
            : 0;


    const image =
        product.image ||
        product.imageUrl ||
        "";


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "caswearCartModal";


    modal.innerHTML = `

        <div class="caswear-modal-overlay">

            <div class="caswear-cart-modal">

                <button
                    type="button"
                    class="caswear-modal-close"
                    id="caswearCloseCartModal">

                    &times;

                </button>


                ${
                    image
                        ? `
                            <img
                                src="${escapeHtml(image)}"
                                alt="${escapeHtml(name)}"
                                class="caswear-modal-product-image"
                                onerror="this.style.display='none';"
                            >
                          `
                        : ""
                }


                <h2>
                    Add to Cart
                </h2>


                <p class="caswear-modal-product-name">
                    ${escapeHtml(name)}
                </p>


                <p class="caswear-modal-price">
                    ₱${price.toFixed(2)}
                </p>


                <button
                    type="button"
                    id="caswearDirectAddButton"
                    class="caswear-add-cart-button">

                    <i class="fa-solid fa-cart-plus"></i>

                    Add to Cart

                </button>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    addModalStyles();


    // ------------------------------------------------------
    // Close
    // ------------------------------------------------------

    modal
        .querySelector(
            "#caswearCloseCartModal"
        )
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );


    // ------------------------------------------------------
    // Click outside
    // ------------------------------------------------------

    modal
        .querySelector(
            ".caswear-modal-overlay"
        )
        .addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    this
                ) {

                    modal.remove();

                }

            }
        );


    // ------------------------------------------------------
    // Add
    // ------------------------------------------------------

    modal
        .querySelector(
            "#caswearDirectAddButton"
        )
        .addEventListener(
            "click",
            function () {

                const added =
                    addProductToCart(
                        product,
                        productId,
                        ""
                    );


                if (added) {

                    modal.remove();

                }

            }
        );

}


// ==========================================================
// ADD MODAL STYLES
// ==========================================================

function addModalStyles() {

    if (
        document.getElementById(
            "caswearProductModalStyles"
        )
    ) {

        return;

    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "caswearProductModalStyles";


    style.textContent = `

        .caswear-modal-overlay {

            position: fixed;

            inset: 0;

            background:
                rgba(0, 0, 0, 0.55);

            display: flex;

            align-items: center;

            justify-content: center;

            padding: 20px;

            z-index: 99998;

        }


        .caswear-size-modal,
        .caswear-cart-modal {

            position: relative;

            width: 100%;

            max-width: 430px;

            background: #ffffff;

            border-radius: 18px;

            padding: 30px;

            text-align: center;

            box-shadow:
                0 15px 50px
                rgba(0, 0, 0, 0.25);

            animation:
                caswearModalAppear
                0.2s ease;

        }


        @keyframes caswearModalAppear {

            from {

                opacity: 0;

                transform:
                    translateY(10px)
                    scale(0.97);

            }

            to {

                opacity: 1;

                transform:
                    translateY(0)
                    scale(1);

            }

        }


        .caswear-modal-close {

            position: absolute;

            top: 12px;

            right: 15px;

            width: 35px;

            height: 35px;

            border: none;

            background: transparent;

            font-size: 28px;

            cursor: pointer;

            color: #3d1700;

        }


        .caswear-modal-product-image {

            width: 180px;

            height: 180px;

            object-fit: contain;

            margin-bottom: 10px;

        }


        .caswear-size-modal h2,
        .caswear-cart-modal h2 {

            margin:
                5px 0 8px;

            color: #3d1700;

            font-family:
                "DM Serif Display",
                serif;

            font-size: 28px;

        }


        .caswear-modal-product-name {

            margin: 5px 0;

            font-size: 18px;

            font-weight: bold;

            color: #3d1700;

        }


        .caswear-modal-price {

            margin: 5px 0 20px;

            font-size: 18px;

            font-weight: bold;

            color: #3d1700;

        }


        .caswear-size-options {

            display: flex;

            flex-wrap: wrap;

            justify-content: center;

            gap: 10px;

            margin:
                20px 0 12px;

        }


        .caswear-size-option {

            width: 55px;

            height: 48px;

            border:
                2px solid #3d1700;

            background: #ffffff;

            color: #3d1700;

            border-radius: 8px;

            font-weight: bold;

            cursor: pointer;

            transition:
                0.2s ease;

        }


        .caswear-size-option:hover {

            background: #fff1c5;

        }


        .caswear-size-option.selected {

            background: #3d1700;

            color: #ffffff;

        }


        .caswear-selected-size {

            min-height: 22px;

            margin:
                8px 0 18px;

            font-size: 14px;

            color: #555555;

        }


        .caswear-add-cart-button {

            width: 100%;

            border: none;

            background: #ffd83d;

            color: #3d1700;

            padding: 14px 20px;

            border-radius: 10px;

            font-size: 16px;

            font-weight: bold;

            cursor: pointer;

            transition:
                0.2s ease;

        }


        .caswear-add-cart-button:hover {

            transform:
                translateY(-1px);

            box-shadow:
                0 5px 12px
                rgba(0, 0, 0, 0.15);

        }


        .firebase-product {

            cursor: pointer;

        }

    `;


    document.head.appendChild(
        style
    );

}


// ==========================================================
// HANDLE FIREBASE PRODUCT CLICK
// ==========================================================

function handleProductClick(
    product,
    productId
) {

    console.log(
        "PRODUCT CLICKED:",
        productId,
        product
    );


    // ------------------------------------------------------
    // REQUIRE LOGIN
    // ------------------------------------------------------

    if (
        auth &&
        !auth.currentUser
    ) {

        alert(
            "Please log in before adding products to your cart."
        );

        return;

    }


    // ------------------------------------------------------
    // CHECK STOCK
    // ------------------------------------------------------

    const stock =
        getProductStock(
            product
        );


    if (
        stock !== null &&
        stock <= 0
    ) {

        alert(
            "This product is currently out of stock."
        );

        return;

    }


    // ------------------------------------------------------
    // SHIRT
    // ------------------------------------------------------

    if (
        requiresSize(product)
    ) {

        showSizeModal(
            product,
            productId
        );

        return;

    }


    // ------------------------------------------------------
    // NON-SHIRT
    // ------------------------------------------------------

    showAddToCartModal(
        product,
        productId
    );

}


// ==========================================================
// CREATE PRODUCT CARD
// ==========================================================

function createProductCard(
    product,
    productId
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "product-card firebase-product";


    card.dataset.productId =
        productId;


    const name =
        product.name ||
        product.productName ||
        "Unnamed Product";


    const category =
        product.category ||
        product.productCategory ||
        "Apparel";


    const price =
        product.price !== undefined &&
        product.price !== null
            ? Number(product.price)
            : 0;


    const image =
        product.image ||
        product.imageUrl ||
        "";


    const stock =
        getProductStock(
            product
        );


    // ------------------------------------------------------
    // STOCK TEXT
    // ------------------------------------------------------

    let stockHtml = "";


    if (stock !== null) {

        stockHtml = `

            <p class="product-stock">

                ${
                    stock > 0
                        ? `${stock} available`
                        : "Out of stock"
                }

            </p>

        `;

    }


    // ------------------------------------------------------
    // IMAGE
    // ------------------------------------------------------

    let imageHtml = "";


    if (image) {

        imageHtml = `

            <div class="product-image-container">

                <img
                    src="${escapeHtml(image)}"
                    alt="${escapeHtml(name)}"
                    class="product-image"
                    onerror="this.style.display='none';"
                >

            </div>

        `;

    } else {

        imageHtml = `

            <div class="product-image-container">

                <div class="product-image-placeholder">

                    No Image

                </div>

            </div>

        `;

    }


    // ------------------------------------------------------
    // CARD CONTENT
    // ------------------------------------------------------

    card.innerHTML = `

        ${imageHtml}

        <div class="product-info">

            <h3 class="product-name">

                ${escapeHtml(name)}

            </h3>


            <p class="product-category">

                ${escapeHtml(category)}

            </p>


            <p class="product-price">

                ₱${price.toFixed(2)}

            </p>


            ${stockHtml}

        </div>

    `;


    // ------------------------------------------------------
    // CLICK
    // ------------------------------------------------------

    card.addEventListener(
        "click",
        function () {

            handleProductClick(
                product,
                productId
            );

        }
    );


    return card;

}


// ==========================================================
// LOAD FIREBASE PRODUCTS
// ==========================================================

function loadProducts(
    targetProgram
) {

    if (!db) {

        console.error(
            "Firestore is not available."
        );

        return;

    }


    if (!productsContainer) {

        console.error(
            "productsContainer is missing."
        );

        return;

    }


    console.log(
        "================================="
    );


    console.log(
        "LOADING PRODUCTS FROM FIRESTORE"
    );


    console.log(
        "TARGET PROGRAM:",
        targetProgram || "ALL"
    );


    console.log(
        "================================="
    );


    const productsRef =
        collection(
            db,
            "products"
        );


    onSnapshot(
        productsRef,

        snapshot => {

            console.log(
                "FIRESTORE PRODUCTS FOUND:",
                snapshot.size
            );


            // ------------------------------------------------
            // Remove previous Firebase products only
            // ------------------------------------------------

            const oldFirebaseProducts =
                productsContainer
                    .querySelectorAll(
                        ".firebase-product"
                    );


            oldFirebaseProducts.forEach(
                card => {

                    card.remove();

                }
            );


            let displayed = 0;


            snapshot.forEach(
                productDoc => {

                    const product =
                        productDoc.data();


                    console.log(
                        "---------------------------------"
                    );


                    console.log(
                        "PRODUCT ID:",
                        productDoc.id
                    );


                    console.log(
                        "PRODUCT:",
                        product
                    );


                    console.log(
                        "PRODUCT PROGRAM:",
                        product.program
                    );


                    const programs =
                        getProductPrograms(
                            product
                        );


                    console.log(
                        "NORMALIZED PROGRAMS:",
                        programs
                    );


                    // ------------------------------------------------
                    // PROGRAM MATCH
                    // ------------------------------------------------

                    const matches =
                        !targetProgram ||
                        programs.includes(
                            targetProgram
                        );


                    console.log(
                        "MATCH:",
                        matches
                    );


                    if (!matches) {

                        return;

                    }


                    const card =
                        createProductCard(
                            product,
                            productDoc.id
                        );


                    productsContainer.appendChild(
                        card
                    );


                    displayed++;

                }
            );


            console.log(
                "FIREBASE PRODUCTS DISPLAYED:",
                displayed
            );

        },

        error => {

            console.error(
                "PRODUCT FIRESTORE ERROR:",
                error
            );


            console.error(
                "ERROR CODE:",
                error.code
            );


            console.error(
                "ERROR MESSAGE:",
                error.message
            );

        }
    );

}


// ==========================================================
// START PRODUCT LOADER
// ==========================================================

async function startProductLoader() {

    if (!app) {

        console.error(
            "Firebase app was not found."
        );


        console.error(
            "Make sure home.js is loaded before product.js."
        );


        return;

    }


    if (!db || !auth) {

        console.error(
            "Firebase Firestore or Auth is unavailable."
        );


        return;

    }


    window.caswearProductDB =
        db;


    window.caswearProductAuth =
        auth;


    console.log(
        "Firebase app found."
    );


    onAuthStateChanged(
        auth,

        async user => {

            console.log(
                "AUTH STATE:",
                user
                    ? user.email
                    : "Guest"
            );


            // ------------------------------------------------
            // PAGE PROGRAM
            // ------------------------------------------------

            const pageProgram =
                getPageProgram();


            if (pageProgram) {

                loadProducts(
                    pageProgram
                );


                updateCartCount();


                return;

            }


            // ------------------------------------------------
            // USER PROGRAM
            // ------------------------------------------------

            if (user) {

                const userProgram =
                    await getUserProgram(
                        user
                    );


                loadProducts(
                    userProgram
                );


                updateCartCount();


                return;

            }


            // ------------------------------------------------
            // GUEST
            // ------------------------------------------------

            loadProducts(
                ""
            );


            updateCartCount();

        }
    );

}


// ==========================================================
// START
// ==========================================================

startProductLoader();


// ==========================================================
// GLOBAL FUNCTIONS
// ==========================================================

window.addProductToCart =
    addProductToCart;

window.showSizeModal =
    showSizeModal;

window.showAddToCartModal =
    showAddToCartModal;

window.updateCartCount =
    updateCartCount;


// ==========================================================
// END
// ==========================================================

console.log(
    "CASWear product.js initialized successfully."
);
