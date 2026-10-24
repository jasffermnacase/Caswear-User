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
    addDoc,
    doc,
    updateDoc,
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
// CURRENT USER
// ==========================================================

let currentUser = null;

let authReady = false;


// ==========================================================
// FIXED PROCESSING FEE
// ==========================================================

const PROCESSING_FEE = 10;


// ==========================================================
// RECEIPT IMAGE SETTINGS
// ==========================================================

// Keep the compressed Base64 receipt below this limit.
// Other document fields also count toward Firestore's
// maximum document size of 1 MiB.

const MAX_RECEIPT_BASE64_LENGTH = 600 * 1024;

const MAX_RECEIPT_WIDTH = 1000;

const MAX_RECEIPT_HEIGHT = 1000;


// ==========================================================
// CHECK FIREBASE AUTH
// ==========================================================

onAuthStateChanged(auth, function(user) {

    currentUser = user;

    authReady = true;

    if (user) {

        console.log("PAYMENT - USER LOGGED IN:", user.uid);

        console.log("PAYMENT - USER EMAIL:", user.email);

    } else {

        console.log("PAYMENT - NO FIREBASE USER");

    }

});


// ==========================================================
// PAGE LOAD
// ==========================================================

document.addEventListener("DOMContentLoaded", function() {

    loadReservationAmount();

});


// ==========================================================
// LOAD RESERVATION AMOUNT
// ==========================================================

function loadReservationAmount() {

    let reservationData = null;

    try {

        reservationData = JSON.parse(
            localStorage.getItem("reservationData")
        );

    } catch (error) {

        console.error(
            "Could not parse reservationData:",
            error
        );

    }

    console.log(
        "PAYMENT - RESERVATION DATA:",
        reservationData
    );


    if (!reservationData) {

        setPaymentAmount(
            0,
            0,
            PROCESSING_FEE,
            PROCESSING_FEE
        );

        console.log("No reservationData found.");

        return;

    }


    const subtotal = Number(reservationData.subtotal) || 0;

    const transferFee = Number(reservationData.transferFee) || 0;

    const processingFee = PROCESSING_FEE;

    const total = subtotal + transferFee + processingFee;


    setPaymentAmount(
        subtotal,
        transferFee,
        processingFee,
        total
    );


    console.log("SUBTOTAL:", subtotal);

    console.log("TRANSFER FEE:", transferFee);

    console.log("PROCESSING FEE:", processingFee);

    console.log("TOTAL:", total);

}


// ==========================================================
// DISPLAY PAYMENT AMOUNT
// ==========================================================

function setPaymentAmount(
    subtotal,
    transferFee,
    processingFee,
    total
) {

    const itemsTotalElement =
        document.getElementById("itemsTotal");

    const subtotalElement =
        document.getElementById("subtotal");

    const transferFeeElement =
        document.getElementById("transferFee");

    const processingFeeElement =
        document.getElementById("processingFee");

    const totalElement =
        document.getElementById("total");


    if (itemsTotalElement) {

        itemsTotalElement.textContent =
            "₱" + subtotal.toFixed(2);

    }


    if (subtotalElement) {

        subtotalElement.textContent =
            "₱" + subtotal.toFixed(2);

    }


    if (transferFeeElement) {

        transferFeeElement.textContent =
            "₱" + transferFee.toFixed(2);

    }


    if (processingFeeElement) {

        processingFeeElement.textContent =
            "₱" + processingFee.toFixed(2);

    }


    if (totalElement) {

        totalElement.textContent =
            "₱" + total.toFixed(2);

    }

}


// ==========================================================
// GET FIRST VALID VALUE
// ==========================================================

function getFirstValidValue(values) {

    for (const value of values) {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return String(value).trim();

        }

    }

    return "";

}


// ==========================================================
// GET RESERVATION ORDER IDENTIFIER
// ==========================================================

function getReservationOrderIdentifier(reservationData) {

    if (!reservationData) {

        return "";

    }


    const pendingOrderId =
        localStorage.getItem("pendingOrderId") || "";


    const possibleIds = [

        reservationData.orderId,

        reservationData.orderID,

        reservationData.order_id,

        reservationData.firestoreOrderId,

        reservationData.firestoreOrderID,

        pendingOrderId,

        reservationData.transactionOrderId,

        reservationData.checkoutOrderId,

        reservationData.reservationId,

        reservationData.reservationID,

        reservationData.id,

        reservationData.orderNumber,

        reservationData.orderNo,

        reservationData.reservationNumber,

        reservationData.reservationNo

    ];


    return getFirstValidValue(possibleIds);

}


// ==========================================================
// GET ORDER NUMBER
// ==========================================================

function getOrderNumber(reservationData) {

    if (!reservationData) {

        return "";

    }


    return getFirstValidValue([

        reservationData.orderNumber,

        reservationData.orderNo,

        reservationData.reservationNumber,

        reservationData.reservationNo

    ]);

}


// ==========================================================
// GET RESERVATION ID
// ==========================================================

function getReservationId(reservationData) {

    if (!reservationData) {

        return "";

    }


    return getFirstValidValue([

        reservationData.reservationId,

        reservationData.reservationID,

        reservationData.reservationNumber,

        reservationData.reservationNo

    ]);

}


// ==========================================================
// GET PAYMENT METHOD
// ==========================================================

function getPaymentMethod(reservationData) {

    if (!reservationData) {

        return "Online Payment (Gcash)";

    }


    const method = getFirstValidValue([

        reservationData.paymentMethod,

        reservationData.payment,

        reservationData.paymentMethodName,

        reservationData.method,

        reservationData.payment_type,

        reservationData.paymentType,

        reservationData.payment_method

    ]);


    if (!method) {

        return "Online Payment (Gcash)";

    }


    return method;

}


// ==========================================================
// CHECK IF CASH PAYMENT
// ==========================================================

function isCashPayment(paymentMethod) {

    const method = String(paymentMethod || "")
        .trim()
        .toLowerCase();


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
// COMPRESS RECEIPT IMAGE FOR FIRESTORE
// ==========================================================

async function compressReceiptImage(file) {

    if (!file) {

        throw new Error("Please select a receipt image.");

    }


    if (!file.type.startsWith("image/")) {

        throw new Error(
            "The receipt must be an image file."
        );

    }


    // Read the selected image.

    const imageDataUrl = await new Promise(
        function(resolve, reject) {

            const reader = new FileReader();

            reader.onload = function() {

                resolve(reader.result);

            };

            reader.onerror = function() {

                reject(
                    new Error("Could not read the receipt image.")
                );

            };

            reader.readAsDataURL(file);

        }
    );


    // Load the image so it can be resized.

    const image = await new Promise(
        function(resolve, reject) {

            const img = new Image();

            img.onload = function() {

                resolve(img);

            };

            img.onerror = function() {

                reject(
                    new Error(
                        "The selected receipt image could not be opened."
                    )
                );

            };

            img.src = imageDataUrl;

        }
    );


    // Keep the image's aspect ratio.

    const scale = Math.min(
        1,
        MAX_RECEIPT_WIDTH / image.width,
        MAX_RECEIPT_HEIGHT / image.height
    );


    const canvas = document.createElement("canvas");

    canvas.width = Math.max(
        1,
        Math.round(image.width * scale)
    );

    canvas.height = Math.max(
        1,
        Math.round(image.height * scale)
    );


    const context = canvas.getContext("2d");


    if (!context) {

        throw new Error(
            "Could not process the receipt image."
        );

    }


    // White background prevents transparent images from
    // becoming black when converted to JPEG.

    context.fillStyle = "#ffffff";

    context.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    context.drawImage(
        image,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Convert the image to compressed JPEG Base64.

    let quality = 0.75;

    let base64Data = "";


    for (let attempt = 0; attempt < 7; attempt++) {

        const dataUrl = canvas.toDataURL(
            "image/jpeg",
            quality
        );


        base64Data = dataUrl.split(",")[1];


        if (
            base64Data &&
            base64Data.length <= MAX_RECEIPT_BASE64_LENGTH
        ) {

            return {
                receiptImage: dataUrl,
                receiptContentType: "image/jpeg",
                receiptFileName: file.name || "receipt.jpg",
                receiptSize: base64Data.length
            };

        }


        quality -= 0.1;

        if (quality < 0.1) {

            quality = 0.1;

        }

    }


    throw new Error(
        "The receipt image is too large to save in Firestore. " +
        "Please choose a smaller image or take a screenshot " +
        "of the receipt and upload that instead."
    );

}


// ==========================================================
// CONTINUE PAYMENT
// ==========================================================

async function continuePayment() {

    console.log("========================================");

    console.log("CONTINUE PAYMENT CLICKED");

    console.log("========================================");


    // ======================================================
    // WAIT FOR AUTHENTICATION TO INITIALIZE
    // ======================================================

    if (!authReady) {

        alert(
            "Please wait a moment while your account loads, " +
            "then try again."
        );

        return;

    }


    // ======================================================
    // GET REFERENCE INPUT
    // ======================================================

    const referenceInput =
        document.getElementById("referenceNumber");


    if (!referenceInput) {

        alert("Reference number input was not found.");

        console.error("Missing #referenceNumber");

        return;

    }


    // ======================================================
    // GET REFERENCE NUMBER
    // ======================================================

    const referenceNumber =
        String(referenceInput.value || "").trim();


    if (referenceNumber === "") {

        alert(
            "Reference number is required.\n\n" +
            "Please enter your payment reference number."
        );

        referenceInput.focus();

        return;

    }


    // ======================================================
    // GET RECEIPT IMAGE
    // ======================================================

    const receiptInput =
        document.getElementById("receiptImage");


    if (!receiptInput) {

        alert(
            "Receipt image input was not found.\n\n" +
            "Please make sure your HTML file input has " +
            'id="receiptImage".'
        );

        console.error("Missing #receiptImage");

        return;

    }


    const receiptFile =
        receiptInput.files && receiptInput.files[0];


    if (!receiptFile) {

        alert(
            "Please upload your payment receipt image " +
            "before continuing."
        );

        receiptInput.focus();

        return;

    }


    // ======================================================
    // GET RESERVATION DATA
    // ======================================================

    let reservationData = null;

    try {

        reservationData = JSON.parse(
            localStorage.getItem("reservationData")
        );

    } catch (error) {

        console.error(
            "Reservation data parse error:",
            error
        );

    }


    if (!reservationData) {

        alert(
            "Reservation information was not found.\n\n" +
            "Please go back and create your reservation again."
        );

        return;

    }


    console.log("========================================");

    console.log("RESERVATION DATA FOR PAYMENT:");

    console.log(reservationData);

    console.log("========================================");


    // ======================================================
    // GET AUTHENTICATED USER ID
    // ======================================================

    if (!currentUser) {

        alert(
            "You must be logged in to submit your payment.\n\n" +
            "Please log in and try again."
        );

        return;

    }


    const userId = currentUser.uid;


    // Ensure the reservation belongs to the signed-in user.

    if (
        reservationData.userId &&
        reservationData.userId !== userId
    ) {

        alert(
            "Your reservation does not match your signed-in account.\n\n" +
            "Please sign in to the account used to create this reservation."
        );

        console.error(
            "RESERVATION USER DOES NOT MATCH AUTHENTICATED USER"
        );

        return;

    }


    console.log("PAYMENT USER ID:", userId);


    // ======================================================
    // GET EXACT ORDER ID
    // ======================================================

    const orderIdentifier =
        getReservationOrderIdentifier(reservationData);


    // ======================================================
    // GET ORDER NUMBER
    // ======================================================

    const orderNumber =
        getOrderNumber(reservationData);


    // ======================================================
    // GET RESERVATION ID
    // ======================================================

    const reservationId =
        getReservationId(reservationData);


    console.log(
        "PAYMENT EXACT ORDER IDENTIFIER:",
        orderIdentifier
    );

    console.log(
        "PAYMENT ORDER NUMBER:",
        orderNumber
    );

    console.log(
        "PAYMENT RESERVATION ID:",
        reservationId
    );


    // ======================================================
    // GET SUBTOTAL
    // ======================================================

    const subtotal =
        Number(reservationData.subtotal) || 0;


    // ======================================================
    // GET TRANSFER FEE
    // ======================================================

    const transferFee =
        Number(reservationData.transferFee) || 0;


    // ======================================================
    // PROCESSING FEE
    // ======================================================

    const processingFee = PROCESSING_FEE;


    // ======================================================
    // COMPUTE FINAL TOTAL
    // ======================================================

    const total =
        subtotal +
        transferFee +
        processingFee;


    // ======================================================
    // PAYMENT METHOD
    // ======================================================

    const paymentMethod =
        getPaymentMethod(reservationData);


    if (isCashPayment(paymentMethod)) {

        console.warn(
            "This payment page is being used for a CASH payment."
        );

    }


    // ======================================================
    // DISABLE BUTTON WHILE SAVING
    // ======================================================

    const continueButton =
        document.querySelector("#continuePayment") ||
        document.querySelector("#continueBtn") ||
        document.querySelector(".continue-payment");


    if (continueButton) {

        continueButton.disabled = true;

        continueButton.style.opacity = "0.6";

    }


    // ======================================================
    // PROCESS AND SAVE PAYMENT
    // ======================================================

    try {

        // ==================================================
        // COMPRESS RECEIPT IMAGE
        // ==================================================

        console.log("Compressing receipt image...");


        const receiptData =
            await compressReceiptImage(receiptFile);


        console.log(
            "RECEIPT IMAGE PROCESSED:",
            receiptData.receiptFileName
        );

        console.log(
            "RECEIPT BASE64 LENGTH:",
            receiptData.receiptSize
        );


        // ==================================================
        // PAYMENT DATA
        // ==================================================

        const paymentData = {

            // --------------------------------------------------
            // USER
            // --------------------------------------------------

            userId: userId,


            // --------------------------------------------------
            // ORDER IDENTIFIERS
            // --------------------------------------------------

            orderId: orderIdentifier,

            orderID: orderIdentifier,

            order_id: orderIdentifier,

            firestoreOrderId: orderIdentifier,

            transactionOrderId: orderIdentifier,

            checkoutOrderId: orderIdentifier,


            // --------------------------------------------------
            // ORDER NUMBER
            // --------------------------------------------------

            orderNumber: orderNumber,

            orderNo: orderNumber,


            // --------------------------------------------------
            // RESERVATION IDENTIFIERS
            // --------------------------------------------------

            reservationId: reservationId,

            reservationID: reservationId,

            reservationNumber:
                reservationData.reservationNumber || "",

            reservationNo:
                reservationData.reservationNo || "",


            // --------------------------------------------------
            // PAYMENT REFERENCE
            // --------------------------------------------------

            referenceNumber: referenceNumber,

            referenceNo: referenceNumber,

            reference: referenceNumber,

            paymentReference: referenceNumber,

            paymentReferenceNumber: referenceNumber,

            paymentRef: referenceNumber,

            paymentRefNumber: referenceNumber,

            gcashReference: referenceNumber,

            gcashReferenceNumber: referenceNumber,

            gcashRef: referenceNumber,

            gcashRefNumber: referenceNumber,

            paymongoReference: referenceNumber,

            paymongoReferenceNumber: referenceNumber,

            paymongoRef: referenceNumber,

            transactionReference: referenceNumber,

            transactionReferenceNumber: referenceNumber,

            externalReference: referenceNumber,

            externalReferenceNumber: referenceNumber,


            // --------------------------------------------------
            // RECEIPT IMAGE — STORED DIRECTLY IN FIRESTORE
            // --------------------------------------------------

            receiptImage: receiptData.receiptImage,

            receiptFileName: receiptData.receiptFileName,

            receiptContentType: receiptData.receiptContentType,

            receiptSize: receiptData.receiptSize,


            // --------------------------------------------------
            // AMOUNTS
            // --------------------------------------------------

            subtotal: subtotal,

            transferFee: transferFee,

            processingFee: processingFee,

            total: total,

            amount: total,

            totalAmount: total,

            amountPaid: total,

            amountDue: total,


            // --------------------------------------------------
            // PAYMENT METHOD
            // --------------------------------------------------

            paymentMethod: paymentMethod,

            paymentMethodName: paymentMethod,

            method: paymentMethod,

            payment: paymentMethod,

            payment_type: paymentMethod,

            paymentType: paymentMethod,

            payment_method: paymentMethod,


            // --------------------------------------------------
            // STATUS
            // --------------------------------------------------

            status: "Pending",

            paymentStatus: "Pending",


            // --------------------------------------------------
            // DATE
            // --------------------------------------------------

            createdAt: serverTimestamp()

        };


        console.log("========================================");

        console.log("PAYMENT DATA TO FIRESTORE:");

        // Do not print the full Base64 image to the console.
        console.log({
            ...paymentData,
            receiptImage: "[Receipt image data omitted]"
        });

        console.log("========================================");


        // ==================================================
        // CREATE PAYMENT DOCUMENT
        // ==================================================

        const paymentRef = await addDoc(
            collection(db, "payments"),
            paymentData
        );


        console.log("========================================");

        console.log("PAYMENT SAVED SUCCESSFULLY");

        console.log("PAYMENT DOCUMENT ID:", paymentRef.id);

        console.log("REFERENCE SAVED:", referenceNumber);

        console.log("ORDER ID SAVED:", orderIdentifier);

        console.log("RECEIPT SAVED DIRECTLY IN FIRESTORE");

        console.log("========================================");


        // ==================================================
        // UPDATE ORIGINAL ORDER
        // ==================================================

        if (orderIdentifier) {

            try {

                const orderDocRef = doc(
                    db,
                    "orders",
                    orderIdentifier
                );


                const orderPaymentUpdate = {

                    // --------------------------------------
                    // REFERENCE FIELDS
                    // --------------------------------------

                    referenceNumber: referenceNumber,

                    referenceNo: referenceNumber,

                    reference: referenceNumber,

                    paymentReference: referenceNumber,

                    paymentReferenceNumber: referenceNumber,

                    paymentRef: referenceNumber,

                    paymentRefNumber: referenceNumber,

                    gcashReference: referenceNumber,

                    gcashReferenceNumber: referenceNumber,

                    gcashRef: referenceNumber,

                    gcashRefNumber: referenceNumber,

                    paymongoReference: referenceNumber,

                    paymongoReferenceNumber: referenceNumber,

                    paymongoRef: referenceNumber,

                    transactionReference: referenceNumber,

                    transactionReferenceNumber: referenceNumber,


                    // --------------------------------------
                    // RECEIPT IMAGE
                    // --------------------------------------

                    receiptImage: receiptData.receiptImage,

                    receiptFileName: receiptData.receiptFileName,

                    receiptContentType:
                        receiptData.receiptContentType,

                    receiptSize: receiptData.receiptSize,


                    // --------------------------------------
                    // PAYMENT INFORMATION
                    // --------------------------------------

                    paymentStatus: "Pending",

                    paymentMethod: paymentMethod,

                    paymentMethodName: paymentMethod,

                    paymentReferenceId: paymentRef.id,


                    // --------------------------------------
                    // AMOUNTS
                    // --------------------------------------

                    paymentAmount: total,

                    amountPaid: total,


                    // --------------------------------------
                    // UPDATED DATE
                    // --------------------------------------

                    updatedAt: serverTimestamp()

                };


                await updateDoc(
                    orderDocRef,
                    orderPaymentUpdate
                );


                console.log(
                    "ORDER UPDATED WITH PAYMENT REFERENCE AND RECEIPT"
                );

                console.log(
                    "ORDER DOCUMENT ID:",
                    orderIdentifier
                );

                console.log(
                    "REFERENCE:",
                    referenceNumber
                );

            } catch (orderUpdateError) {

                // The payment document was already created.
                // Keep it so the admin can still find the payment
                // and receipt in the payments collection.

                console.warn(
                    "PAYMENT SAVED, BUT ORDER UPDATE FAILED."
                );

                console.warn(
                    "Check Firestore security rules and the order ID."
                );

                console.warn(
                    "ORDER ID:",
                    orderIdentifier
                );

                console.warn(
                    "ORDER UPDATE ERROR:",
                    orderUpdateError
                );

            }

        } else {

            console.warn(
                "NO EXACT ORDER ID WAS FOUND."
            );

            console.warn(
                "Payment and receipt were saved in the payments collection."
            );

            console.warn(
                "Make sure reservation.js saves the actual Firestore orderId."
            );

        }


        // ==================================================
        // SAVE PAYMENT LOCALLY
        // ==================================================

        // Keep the local copy small. The full receipt image
        // is stored in Firestore, not in localStorage.

        const savedPaymentData = {

            paymentId: paymentRef.id,


            // ----------------------------------------------
            // ORDER IDENTIFIERS
            // ----------------------------------------------

            orderId: orderIdentifier,

            orderID: orderIdentifier,

            order_id: orderIdentifier,

            firestoreOrderId: orderIdentifier,


            // ----------------------------------------------
            // ORDER NUMBER
            // ----------------------------------------------

            orderNumber: orderNumber,

            orderNo: orderNumber,


            // ----------------------------------------------
            // RESERVATION IDENTIFIERS
            // ----------------------------------------------

            reservationId: reservationId,

            reservationID: reservationId,

            reservationNumber:
                reservationData.reservationNumber || "",

            reservationNo:
                reservationData.reservationNo || "",


            // ----------------------------------------------
            // USER
            // ----------------------------------------------

            userId: userId,


            // ----------------------------------------------
            // REFERENCES
            // ----------------------------------------------

            referenceNumber: referenceNumber,

            referenceNo: referenceNumber,

            reference: referenceNumber,

            paymentReference: referenceNumber,

            paymentReferenceNumber: referenceNumber,

            paymentRef: referenceNumber,

            paymentRefNumber: referenceNumber,

            gcashReference: referenceNumber,

            gcashReferenceNumber: referenceNumber,

            paymongoReference: referenceNumber,


            // ----------------------------------------------
            // RECEIPT METADATA
            // ----------------------------------------------

            receiptFileName: receiptData.receiptFileName,

            receiptContentType: receiptData.receiptContentType,


            // ----------------------------------------------
            // AMOUNTS
            // ----------------------------------------------

            subtotal: subtotal,

            transferFee: transferFee,

            processingFee: processingFee,

            total: total,

            amount: total,

            totalAmount: total,

            amountPaid: total,

            amountDue: total,


            // ----------------------------------------------
            // PAYMENT METHOD
            // ----------------------------------------------

            paymentMethod: paymentMethod,

            paymentMethodName: paymentMethod,

            method: paymentMethod,

            payment: paymentMethod,


            // ----------------------------------------------
            // STATUS
            // ----------------------------------------------

            status: "Pending",

            paymentStatus: "Pending"

        };


        localStorage.setItem(
            "paymentData",
            JSON.stringify(savedPaymentData)
        );


        // ==================================================
        // UPDATE RESERVATION DATA
        // ==================================================

        reservationData.userId = userId;

        reservationData.processingFee = processingFee;

        reservationData.total = total;

        reservationData.referenceNumber = referenceNumber;

        reservationData.referenceNo = referenceNumber;

        reservationData.reference = referenceNumber;

        reservationData.paymentReference = referenceNumber;

        reservationData.paymentReferenceNumber = referenceNumber;

        reservationData.paymentRef = referenceNumber;

        reservationData.paymentRefNumber = referenceNumber;


        // --------------------------------------------------
        // SAVE EXACT ORDER ID
        // --------------------------------------------------

        if (orderIdentifier) {

            reservationData.orderId = orderIdentifier;

            reservationData.orderID = orderIdentifier;

            reservationData.order_id = orderIdentifier;

            reservationData.firestoreOrderId = orderIdentifier;

        }


        // --------------------------------------------------
        // SAVE ORDER NUMBER
        // --------------------------------------------------

        if (orderNumber) {

            reservationData.orderNumber = orderNumber;

            reservationData.orderNo = orderNumber;

        }


        // --------------------------------------------------
        // SAVE PAYMENT METHOD
        // --------------------------------------------------

        reservationData.paymentMethod = paymentMethod;

        reservationData.payment = paymentMethod;


        // --------------------------------------------------
        // SAVE RECEIPT METADATA
        // --------------------------------------------------

        reservationData.receiptFileName =
            receiptData.receiptFileName;

        reservationData.receiptContentType =
            receiptData.receiptContentType;


        // --------------------------------------------------
        // SAVE RESERVATION DATA
        // --------------------------------------------------

        localStorage.setItem(
            "reservationData",
            JSON.stringify(reservationData)
        );


        // ==================================================
        // SUCCESS MESSAGE
        // ==================================================

        alert(

            "Payment submitted successfully!\n\n" +

            "Reference No.: " +
            referenceNumber +

            "\n" +

            "Subtotal: ₱" +
            subtotal.toFixed(2) +

            "\n" +

            "Transfer Fee: ₱" +
            transferFee.toFixed(2) +

            "\n" +

            "Processing Fee: ₱" +
            processingFee.toFixed(2) +

            "\n" +

            "Total: ₱" +
            total.toFixed(2) +

            "\n\n" +

            "Your receipt has been submitted for verification."

        );


        // ==================================================
        // GO TO ORDERS
        // ==================================================

        window.location.href = "orders.html";

    } catch (error) {

        console.error("=================================");

        console.error("PAYMENT FIRESTORE ERROR");

        console.error("CODE:", error.code);

        console.error("MESSAGE:", error.message);

        console.error("=================================");


        alert(

            "Failed to save payment.\n\n" +

            "Error Code: " +
            (error.code || "unknown") +

            "\n\n" +

            "Message: " +
            (error.message || "Unknown error")

        );

    } finally {

        // If the page is still here, re-enable the button.
        // A successful payment will redirect to orders.html.

        if (
            continueButton &&
            window.location.pathname.endsWith("payment.html")
        ) {

            continueButton.disabled = false;

            continueButton.style.opacity = "1";

        }

    }

}


// ==========================================================
// MAKE FUNCTION AVAILABLE TO HTML
// ==========================================================

window.continuePayment = continuePayment;


// ==========================================================
// END PAYMENT.JS
// ==========================================================