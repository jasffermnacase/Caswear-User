
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    query,
    where,
    doc,
    updateDoc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ==========================================================
// FIREBASE CONFIG
// ==========================================================

const firebaseConfig = {

    apiKey: "AIzaSyAqlEDKaGECuc8ycmzZVHD7gQeZcqnm7ek",

    authDomain: "caswear-c21e2.firebaseapp.com",

    projectId: "caswear-c21e2",

    storageBucket: "caswear-c21e2.firebasestorage.app",

    messagingSenderId: "842998215942",

    appId: "1:842998215942:web:fcd283e0cd118451951a87",

    measurementId: "G-317N3TECX6"

};


// ==========================================================
// INITIALIZE FIREBASE
// ==========================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ==========================================================
// ORDERS ELEMENT
// ==========================================================

const ordersList =
    document.getElementById("ordersList");

let orders = [];

let currentUser = null;


// ==========================================================
// PAYMENT DATA
// ==========================================================

let payments = [];


// ==========================================================
// FORMAT CURRENCY
// ==========================================================

function formatCurrency(amount) {

    const number =
        Number(amount) || 0;

    return number.toLocaleString(
        "en-PH",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


// ==========================================================
// GET ORDER SUBTOTAL / TOTAL
// ==========================================================

function getOrderTotal(order) {

    if (
        order.subtotal !== undefined &&
        order.subtotal !== null
    ) {

        return Number(order.subtotal) || 0;

    }


    if (
        order.totalAmount !== undefined &&
        order.totalAmount !== null
    ) {

        return Number(order.totalAmount) || 0;

    }


    if (
        order.total !== undefined &&
        order.total !== null
    ) {

        return Number(order.total) || 0;

    }


    if (
        order.grandTotal !== undefined &&
        order.grandTotal !== null
    ) {

        return Number(order.grandTotal) || 0;

    }


    return 0;

}


// ==========================================================
// NORMALIZE VALUE
// ==========================================================

function normalizeValue(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return String(value)
        .trim()
        .toLowerCase();

}


// ==========================================================
// GET PAYMENT METHOD
// ==========================================================

function getPaymentMethod(data) {

    if (!data) {

        return "";

    }

    return (
        data.paymentMethod ||
        data.paymentMethodName ||
        data.payment ||
        data.method ||
        data.paymentType ||
        data.payment_type ||
        data.payment_method ||
        data.type ||
        ""
    );

}


// ==========================================================
// CHECK CASH PAYMENT
// ==========================================================

function isCashPayment(data) {

    const method =
        normalizeValue(
            getPaymentMethod(data)
        );


    if (!method) {

        return false;

    }


    return (

        method === "cash" ||

        method === "cash payment" ||

        method === "cashpayment" ||

        method === "cod" ||

        method === "cash on delivery" ||

        method.includes("cash")

    );

}


// ==========================================================
// CHECK ONLINE PAYMENT
// ==========================================================

function isOnlinePayment(data) {

    const method =
        normalizeValue(
            getPaymentMethod(data)
        );


    return (

        method.includes("gcash") ||

        method.includes("paymongo") ||

        method.includes("online") ||

        method.includes("e-wallet") ||

        method.includes("ewallet")

    );

}


// ==========================================================
// GET VALID PAYMENT REFERENCE
// ==========================================================

function getPaymentReference(payment) {

    if (!payment) {

        return "";

    }


    const possibleReferences = [

        payment.referenceNumber,

        payment.referenceNo,

        payment.reference,

        payment.paymentReference,

        payment.paymentReferenceNumber,

        payment.paymentRef,

        payment.paymentRefNumber,

        payment.gcashReference,

        payment.gcashReferenceNumber,

        payment.gcashRef,

        payment.gcashRefNumber,

        payment.paymongoReference,

        payment.paymongoReferenceNumber,

        payment.paymongoRef,

        payment.paymongoRefNumber,

        payment.transactionReference,

        payment.transactionReferenceNumber,

        payment.transactionId,

        payment.transactionID,

        payment.checkoutReference,

        payment.checkoutReferenceNumber,

        payment.checkoutId,

        payment.checkoutID,

        payment.refNumber,

        payment.refNo,

        payment.externalReference,

        payment.externalReferenceNumber

    ];


    for (
        const value of possibleReferences
    ) {

        if (
            value === undefined ||
            value === null
        ) {

            continue;

        }


        const reference =
            String(value).trim();


        if (!reference) {

            continue;

        }


        const normalized =
            reference.toLowerCase();


        // Ignore placeholders

        if (

            normalized === "n/a" ||

            normalized === "na" ||

            normalized === "none" ||

            normalized === "null" ||

            normalized === "undefined" ||

            normalized === "not available" ||

            normalized === "no reference number"

        ) {

            continue;

        }


        return reference;

    }


    return "";

}


// ==========================================================
// GET ORDER IDENTIFIERS
// ==========================================================

function getOrderIdentifiers(order) {

    if (!order) {

        return [];

    }


    const identifiers = [

        order.id,

        order.orderId,

        order.orderID,

        order.order_id,

        order.orderNumber,

        order.orderNo,

        order.reservationId,

        order.reservationID,

        order.reservationNumber,

        order.reservationNo,

        order.transactionOrderId,

        order.checkoutOrderId

    ];


    return identifiers

        .filter(
            function (value) {

                return (

                    value !== undefined &&

                    value !== null &&

                    String(value).trim() !== ""

                );

            }
        )

        .map(
            function (value) {

                return normalizeValue(
                    value
                );

            }
        );

}


// ==========================================================
// GET PAYMENT IDENTIFIERS
// ==========================================================

function getPaymentIdentifiers(payment) {

    if (!payment) {

        return [];

    }


    const identifiers = [

        payment.orderId,

        payment.orderID,

        payment.order_id,

        payment.orderNumber,

        payment.orderNo,

        payment.reservationId,

        payment.reservationID,

        payment.reservationNumber,

        payment.reservationNo,

        payment.transactionOrderId,

        payment.checkoutOrderId

    ];


    return identifiers

        .filter(
            function (value) {

                return (

                    value !== undefined &&

                    value !== null &&

                    String(value).trim() !== ""

                );

            }
        )

        .map(
            function (value) {

                return normalizeValue(
                    value
                );

            }
        );

}


// ==========================================================
// FIND PAYMENT FOR ORDER
// ==========================================================

function getPaymentForOrder(order) {

    if (!order) {

        return null;

    }


    const orderIdentifiers =
        getOrderIdentifiers(
            order
        );


    console.log(
        "Searching payment for order:",
        order.orderNumber,
        orderIdentifiers
    );


    // ======================================================
    // FIRST: EXACT IDENTIFIER MATCH
    // ======================================================

    let payment =
        payments.find(
            function (item) {

                const paymentIdentifiers =
                    getPaymentIdentifiers(
                        item
                    );


                return paymentIdentifiers.some(
                    function (identifier) {

                        return orderIdentifiers.includes(
                            identifier
                        );

                    }
                );

            }
        );


    if (payment) {

        console.log(
            "Payment matched by identifier:",
            payment
        );

        return payment;

    }


    // ======================================================
    // SECOND: MATCH ORDER NUMBER
    // ======================================================

    const orderNumber =
        normalizeValue(
            order.orderNumber
        );


    if (orderNumber) {

        payment =
            payments.find(
                function (item) {

                    return (

                        normalizeValue(
                            item.orderNumber
                        ) === orderNumber ||

                        normalizeValue(
                            item.orderNo
                        ) === orderNumber

                    );

                }
            );


        if (payment) {

            console.log(
                "Payment matched by order number:",
                payment
            );

            return payment;

        }

    }


    // ======================================================
    // THIRD: MATCH RESERVATION ID
    // ======================================================

    const reservationIds = [

        order.id,

        order.reservationId,

        order.reservationID,

        order.reservationNumber,

        order.reservationNo

    ]

        .filter(
            function (value) {

                return (

                    value !== undefined &&

                    value !== null &&

                    String(value).trim() !== ""

                );

            }
        )

        .map(
            function (value) {

                return normalizeValue(
                    value
                );

            }
        );


    payment =
        payments.find(
            function (item) {

                const paymentReservationIds = [

                    item.reservationId,

                    item.reservationID,

                    item.reservationNumber,

                    item.reservationNo

                ]

                    .filter(
                        function (value) {

                            return (

                                value !== undefined &&

                                value !== null &&

                                String(value).trim() !== ""

                            );

                        }
                    )

                    .map(
                        function (value) {

                            return normalizeValue(
                                value
                            );

                        }
                    );


                return paymentReservationIds.some(
                    function (value) {

                        return reservationIds.includes(
                            value
                        );

                    }
                );

            }
        );


    if (payment) {

        console.log(
            "Payment matched by reservation:",
            payment
        );

        return payment;

    }


    // ======================================================
    // NO PAYMENT FOUND
    // ======================================================

    console.warn(
        "No payment found for order:",
        order
    );


    return null;

}


// ==========================================================
// LOAD PAYMENTS
// ==========================================================

async function loadPayments(user) {

    try {

        const paymentsQuery =
            query(

                collection(
                    db,
                    "payments"
                ),

                where(
                    "userId",
                    "==",
                    user.uid
                )

            );


        const paymentSnapshot =
            await getDocs(
                paymentsQuery
            );


        payments = [];


        paymentSnapshot.forEach(
            function (docSnapshot) {

                payments.push({

                    id:
                        docSnapshot.id,

                    ...docSnapshot.data()

                });

            }
        );


        console.log(
            "======================================"
        );

        console.log(
            "PAYMENTS LOADED:",
            payments.length
        );

        console.log(
            payments
        );

        console.log(
            "======================================"
        );


    } catch (error) {

        console.error(
            "Error loading payments:",
            error
        );

        payments = [];

    }

}


// ==========================================================
// LOAD ORDERS
// ==========================================================

async function loadOrders(user) {

    if (!ordersList) {

        console.error(
            "ordersList not found."
        );

        return;

    }


    try {

        // ==================================================
        // LOAD PAYMENTS FIRST
        // ==================================================

        await loadPayments(
            user
        );


        // ==================================================
        // LOAD CURRENT USER ORDERS
        // ==================================================

        const ordersQuery =
            query(

                collection(
                    db,
                    "orders"
                ),

                where(
                    "userId",
                    "==",
                    user.uid
                )

            );


        const snapshot =
            await getDocs(
                ordersQuery
            );


        orders = [];


        snapshot.forEach(
            function (docSnapshot) {

                orders.push({

                    id:
                        docSnapshot.id,

                    ...docSnapshot.data()

                });

            }
        );


        // ==================================================
        // SORT NEWEST FIRST
        // ==================================================

        orders.sort(
            function (a, b) {

                let timeA = 0;

                let timeB = 0;


                try {

                    if (a.createdAt) {

                        timeA =
                            a.createdAt.toMillis();

                    }

                } catch (error) {

                    timeA = 0;

                }


                try {

                    if (b.createdAt) {

                        timeB =
                            b.createdAt.toMillis();

                    }

                } catch (error) {

                    timeB = 0;

                }


                return timeB - timeA;

            }
        );


        // ==================================================
        // DISPLAY
        // ==================================================

        displayOrders(
            "All"
        );


    } catch (error) {

        console.error(
            "Error loading orders:",
            error
        );


        ordersList.innerHTML = `

            <div class="no-orders">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h2>
                    Unable to load orders.
                </h2>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}


// ==========================================================
// DISPLAY ORDERS
// ==========================================================

function displayOrders(filter) {

    if (!ordersList) {

        return;

    }


    ordersList.innerHTML = "";


    let filteredOrders;


    // ======================================================
    // ALL ORDERS
    // ======================================================

    if (filter === "All") {

        filteredOrders =
            orders.filter(
                function (order) {

                    return (

                        normalizeValue(
                            order.status
                        ) !==
                        "cancelled"

                    );

                }
            );

    }


    // ======================================================
    // SPECIFIC STATUS
    // ======================================================

    else {

        filteredOrders =
            orders.filter(
                function (order) {

                    return (

                        normalizeValue(
                            order.status
                        ) ===
                        normalizeValue(
                            filter
                        )

                    );

                }
            );

    }


    // ======================================================
    // NO ORDERS
    // ======================================================

    if (
        filteredOrders.length === 0
    ) {

        ordersList.innerHTML = `

            <div class="no-orders">

                <i class="fa-solid fa-box-open"></i>

                <h2>

                    No ${
                        filter === "All"
                            ? ""
                            : filter.toLowerCase() + " "
                    }reservations found.

                </h2>

                <p>
                    Your reservations will appear here.
                </p>

            </div>

        `;

        return;

    }


    // ======================================================
    // CREATE ORDER CARDS
    // ======================================================

    filteredOrders.forEach(
        function (order) {

            const orderCard =
                document.createElement(
                    "div"
                );


            orderCard.className =
                "order-card";


            // ==================================================
            // ORDER DATE
            // ==================================================

            let date =
                "Date unavailable";


            if (order.createdAt) {

                try {

                    date =
                        order.createdAt
                            .toDate()
                            .toLocaleDateString(
                                "en-US",
                                {

                                    month: "long",

                                    day: "2-digit",

                                    year: "numeric"

                                }
                            );

                } catch (error) {

                    console.log(
                        "Invalid order date:",
                        error
                    );

                }

            }


            // ==================================================
            // STATUS
            // ==================================================

            const status =
                order.status ||
                "Pending";


            const statusClass =
                String(status)
                    .toLowerCase()
                    .replace(
                        /\s+/g,
                        "-"
                    );


            // ==================================================
            // SUBTOTAL
            // ==================================================

            const subtotal =
                getOrderTotal(
                    order
                );


            const formattedSubtotal =
                formatCurrency(
                    subtotal
                );


            // ==================================================
            // PAYMENT
            // ==================================================

            const payment =
                getPaymentForOrder(
                    order
                );


            // ==================================================
            // PAYMENT METHOD
            // ==================================================

            const paymentMethod =
                getPaymentMethod(
                    payment || order
                ) ||
                "N/A";


            // ==================================================
            // REFERENCE NUMBER
            // ==================================================

            let referenceNumber =
                "N/A";


            if (
                isCashPayment(
                    payment || order
                )
            ) {

                referenceNumber =
                    "N/A";

            } else {

                const paymentReference =
                    getPaymentReference(
                        payment
                    );


                const orderReference =
                    getPaymentReference(
                        order
                    );


                if (paymentReference) {

                    referenceNumber =
                        paymentReference;

                } else if (orderReference) {

                    referenceNumber =
                        orderReference;

                } else {

                    referenceNumber =
                        "Not available";

                }

            }


            // ==================================================
            // CANCEL BUTTON
            // ==================================================

            let cancelButton = "";


            if (
                normalizeValue(status)
                ===
                "pending"
            ) {

                cancelButton = `

                    <button
                        type="button"
                        class="cancel-order-btn"
                        data-id="${order.id}"
                    >

                        <i class="fa-solid fa-xmark"></i>

                        Cancel Reservation

                    </button>

                `;

            }


            // ==================================================
            // ORDER CARD
            // ==================================================

            orderCard.innerHTML = `

                <div class="order-info">

                    <h3>

                        Order ${
                            order.orderNumber ||
                            order.id
                        }

                    </h3>


                    <p>

                        ${
                            order.program ||
                            "N/A"
                        }

                    </p>


                    <p>

                        ${
                            order.yearLevel ||
                            "N/A"
                        }

                        Year

                        &nbsp;

                        ${
                            order.section ||
                            ""
                        }

                    </p>


                    <p>

                        ID:
                        ${
                            order.idNumber ||
                            "N/A"
                        }

                    </p>


                    <p>

                        Payment:
                        ${
                            paymentMethod
                        }

                    </p>


                    <p>

                        Reference Number:
                        ${
                            referenceNumber
                        }

                    </p>


                    <p class="order-total">

                        <strong>
                            Subtotal:
                        </strong>

                        ₱ ${formattedSubtotal}

                    </p>

                </div>


                <div class="order-status">

                    <span
                        class="status ${statusClass}"
                    >

                        ${status}

                    </span>


                    <p class="order-date">

                        ${date}

                    </p>


                    <div class="order-buttons">

    ${cancelButton}

    <button
        type="button"
        class="view-details"
        data-id="${order.id}"
    >

        <i class="fa-solid fa-eye"></i>

        <span>
            View Details
        </span>

    </button>

</div>

            `;


            ordersList.appendChild(
                orderCard
            );

        }
    );

}


// ==========================================================
// CANCEL RESERVATION
// ==========================================================

async function cancelOrder(orderId) {

    const order =
        orders.find(
            function (item) {

                return (
                    item.id ===
                    orderId
                );

            }
        );


    if (!order) {

        alert(
            "Order could not be found."
        );

        return;

    }


    if (!currentUser) {

        alert(
            "Please log in first."
        );

        return;

    }


    if (
        normalizeValue(
            order.status
        ) !==
        "pending"
    ) {

        alert(
            "Only pending reservations can be cancelled."
        );

        return;

    }


    const confirmation =
        confirm(
            "Are you sure you want to cancel this reservation?"
        );


    if (!confirmation) {

        return;

    }


    try {

        // ==================================================
        // UPDATE ORDER
        // ==================================================

        const orderRef =
            doc(
                db,
                "orders",
                orderId
            );


        await updateDoc(
            orderRef,
            {

                status:
                    "Cancelled",

                cancelledAt:
                    serverTimestamp()

            }
        );


        // ==================================================
        // CREATE NOTIFICATION
        // ==================================================

        const notificationId =
            orderId +
            "_cancelled";


        const notificationRef =
            doc(
                db,
                "notifications",
                notificationId
            );


        await setDoc(
            notificationRef,
            {

                userId:
                    currentUser.uid,

                orderId:
                    orderId,

                status:
                    "cancelled",

                message:
                    "❌ Your reservation " +
                    (
                        order.orderNumber ||
                        orderId
                    ) +
                    " has been cancelled.",

                read:
                    false,

                createdAt:
                    serverTimestamp()

            }
        );


        // ==================================================
        // UPDATE LOCAL ORDER
        // ==================================================

        order.status =
            "Cancelled";


        // ==================================================
        // ACTIVE TAB
        // ==================================================

        const activeTab =
            document.querySelector(
                ".order-tabs button.active"
            );


        const currentFilter =
            activeTab
                ? activeTab.dataset.filter
                : "All";


        displayOrders(
            currentFilter
        );


        alert(
            "Your reservation has been cancelled successfully."
        );


    } catch (error) {

        console.error(
            "ERROR CANCELLING RESERVATION:",
            error
        );


        alert(
            "Unable to cancel your reservation. Please try again."
        );

    }

}


// ==========================================================
// FILTER BUTTONS
// ==========================================================

const orderTabs =
    document.querySelectorAll(
        ".order-tabs button"
    );


orderTabs.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                orderTabs.forEach(
                    function (btn) {

                        btn.classList.remove(
                            "active"
                        );

                    }
                );


                this.classList.add(
                    "active"
                );


                displayOrders(
                    this.dataset.filter
                );

            }
        );

    }
);


// ==========================================================
// ORDER LIST CLICK EVENTS
// ==========================================================

if (ordersList) {

    ordersList.addEventListener(
        "click",
        function (event) {

            // ==================================================
            // VIEW DETAILS
            // ==================================================

            const viewButton =
                event.target.closest(
                    ".view-details"
                );


            if (viewButton) {

                const orderId =
                    viewButton.dataset.id;


                const order =
                    orders.find(
                        function (item) {

                            return (
                                item.id ===
                                orderId
                            );

                        }
                    );


                if (!order) {

                    return;

                }


                // ==================================================
                // FIND PAYMENT
                // ==================================================

                const payment =
                    getPaymentForOrder(
                        order
                    );


                // ==================================================
                // SUBTOTAL
                // ==================================================

                const subtotal =
                    getOrderTotal(
                        order
                    );


                // ==================================================
                // TRANSFER FEE
                // ==================================================

                const transferFee =
                    payment
                        ? Number(
                            payment.transferFee
                        ) || 0
                        : Number(
                            order.transferFee
                        ) || 0;


                // ==================================================
                // PROCESSING FEE
                // ==================================================

                const processingFee =
                    payment
                        ? Number(
                            payment.processingFee
                        ) || 0
                        : Number(
                            order.processingFee
                        ) || 0;


                // ==================================================
                // TOTAL
                // ==================================================

                const total =
                    payment
                        ? Number(
                            payment.total
                        ) || (
                            subtotal +
                            transferFee +
                            processingFee
                        )
                        : Number(
                            order.total
                        ) || (
                            subtotal +
                            transferFee +
                            processingFee
                        );


                // ==================================================
                // REFERENCE NUMBER
                // ==================================================

                let referenceNumber =
                    "N/A";


                if (
                    isCashPayment(
                        payment || order
                    )
                ) {

                    referenceNumber =
                        "N/A";

                } else {

                    const paymentReference =
                        getPaymentReference(
                            payment
                        );


                    const orderReference =
                        getPaymentReference(
                            order
                        );


                    referenceNumber =
                        paymentReference ||
                        orderReference ||
                        "Not available";

                }


                // ==================================================
                // PAYMENT STATUS
                // ==================================================

                const paymentStatus =
                    payment
                        ? (
                            payment.status ||
                            payment.paymentStatus ||
                            "Pending"
                        )
                        : (
                            order.paymentStatus ||
                            "Not available"
                        );


                // ==================================================
                // FORMATTED AMOUNTS
                // ==================================================

                const formattedSubtotal =
                    formatCurrency(
                        subtotal
                    );


                const formattedTransferFee =
                    formatCurrency(
                        transferFee
                    );


                const formattedProcessingFee =
                    formatCurrency(
                        processingFee
                    );


                const formattedTotal =
                    formatCurrency(
                        total
                    );


                // ==================================================
                // VIEW DETAILS
                // ==================================================

                alert(

                    "ORDER DETAILS\n\n" +

                    "Order Number: " +
                    (
                        order.orderNumber ||
                        "N/A"
                    ) +

                    "\n\nName: " +
                    (
                        order.fullName ||
                        "N/A"
                    ) +

                    "\n\nEmail: " +
                    (
                        order.email ||
                        "N/A"
                    ) +

                    "\n\nContact: " +
                    (
                        order.contact ||
                        "N/A"
                    ) +

                    "\n\nProgram: " +
                    (
                        order.program ||
                        "N/A"
                    ) +

                    "\n\nYear Level: " +
                    (
                        order.yearLevel ||
                        "N/A"
                    ) +

                    "\n\nSection: " +
                    (
                        order.section ||
                        "N/A"
                    ) +

                    "\n\nID Number: " +
                    (
                        order.idNumber ||
                        "N/A"
                    ) +

                    "\n\nClaiming Location: " +
                    (
                        order.claimingLocation ||
                        "N/A"
                    ) +

                    "\n\nPayment: " +
                    (
                        getPaymentMethod(
                            payment || order
                        ) ||
                        "N/A"
                    ) +

                    "\n\nReference Number: " +
                    referenceNumber +

                    "\n\nSubtotal: ₱" +
                    formattedSubtotal +

                    "\n\nTransfer Fee: ₱" +
                    formattedTransferFee +

                    "\n\nProcessing Fee: ₱" +
                    formattedProcessingFee +

                    "\n\nTotal: ₱" +
                    formattedTotal +

                    "\n\nPayment Status: " +
                    paymentStatus +

                    "\n\nReservation Status: " +
                    (
                        order.status ||
                        "Pending"
                    )

                );


                return;

            }


            // ==================================================
            // CANCEL RESERVATION
            // ==================================================

            const cancelButton =
                event.target.closest(
                    ".cancel-order-btn"
                );


            if (cancelButton) {

                const orderId =
                    cancelButton.dataset.id;


                cancelOrder(
                    orderId
                );

            }

        }
    );

}


// ==========================================================
// AUTH STATE
// ==========================================================

onAuthStateChanged(
    auth,
    function (user) {

        if (user) {

            currentUser =
                user;


            console.log(
                "Logged in user:",
                user.email
            );


            console.log(
                "User UID:",
                user.uid
            );


            loadOrders(
                user
            );

        } else {

            currentUser =
                null;


            orders = [];

            payments = [];


            if (ordersList) {

                ordersList.innerHTML = `

                    <div class="no-orders">

                        <i class="fa-solid fa-user-lock"></i>

                        <h2>
                            Please log in
                        </h2>

                        <p>
                            Please log in to view
                            your orders.
                        </p>

                    </div>

                `;

            }

        }

    }
);


// ==========================================================
// MAKE FUNCTION AVAILABLE
// ==========================================================

window.cancelOrder =
    cancelOrder;


// ==========================================================
// END
// ==========================================================

console.log(
    "CASWear orders.js finished loading."
);