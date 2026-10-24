// ============================================
// CASWear - Payment Receipt Image Preview
// File: receipt-preview.js
// ============================================

document.addEventListener("DOMContentLoaded", function () {

    // Get HTML elements
    const receiptInput = document.getElementById("receiptImage");
    const uploadBox = document.getElementById("uploadBox");
    const previewContainer = document.getElementById("receiptPreviewContainer");
    const previewImage = document.getElementById("receiptPreview");
    const fileName = document.getElementById("receiptFileName");
    const removeButton = document.getElementById("removeReceipt");

    // ============================================
    // CHECK REQUIRED ELEMENTS
    // ============================================

    if (
        !receiptInput ||
        !uploadBox ||
        !previewContainer ||
        !previewImage ||
        !fileName ||
        !removeButton
    ) {
        console.error(
            "CASWear: Receipt preview elements are missing."
        );

        return;
    }

    // ============================================
    // INITIALIZE RECEIPT PREVIEW
    // ============================================

    previewContainer.style.display = "none";

    // ============================================
    // HANDLE IMAGE SELECTION
    // ============================================

    receiptInput.addEventListener("change", function () {

        const file = receiptInput.files[0];

        // Stop if no file is selected
        if (!file) {
            return;
        }

        // ========================================
        // VALIDATE IMAGE TYPE
        // ========================================

        const allowedTypes = [
            "image/jpeg",
            "image/png"
        ];

        if (!allowedTypes.includes(file.type)) {

            alert(
                "Invalid file format!\n\n" +
                "Please upload a JPG, JPEG, or PNG image."
            );

            receiptInput.value = "";

            return;
        }

        // ========================================
        // VALIDATE IMAGE SIZE (MAXIMUM 5 MB)
        // ========================================

        const MAX_FILE_SIZE = 5 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) {

            alert(
                "Image is too large!\n\n" +
                "Your payment receipt must not exceed 5 MB."
            );

            receiptInput.value = "";

            return;
        }

        // ========================================
        // READ SELECTED IMAGE
        // ========================================

        const reader = new FileReader();

        reader.onload = function (event) {

            // Display the selected image
            previewImage.src = event.target.result;

            // Display the filename
            fileName.textContent = file.name;

            // Show the preview container
            previewContainer.style.display = "block";

            // Hide the original upload box
            uploadBox.style.display = "none";

            console.log(
                "CASWear: Receipt preview displayed.",
                file.name
            );
        };

        reader.onerror = function () {

            alert(
                "Unable to display the selected image.\n\n" +
                "Please try another image."
            );

            receiptInput.value = "";
        };

        // Convert the image into a preview
        reader.readAsDataURL(file);

    });

    // ============================================
    // REMOVE SELECTED RECEIPT
    // ============================================

    removeButton.addEventListener("click", function () {

        // Clear the selected file
        receiptInput.value = "";

        // Clear the image preview
        previewImage.removeAttribute("src");

        // Clear the filename
        fileName.textContent = "";

        // Hide the preview container
        previewContainer.style.display = "none";

        // Show the upload box again
        uploadBox.style.display = "flex";

        console.log(
            "CASWear: Receipt removed successfully."
        );

    });

    console.log(
        "CASWear: Receipt preview initialized successfully."
    );

});