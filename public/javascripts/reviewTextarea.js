document.addEventListener("DOMContentLoaded", function () {
    const reviewTextarea = document.getElementById("body");
    const descriptionTextarea = document.getElementById("description");
    const reviewCharCount = document.getElementById("reviewCharCount");
    const charCount = document.getElementById("charCount");

    function setupTextarea(textarea, countElement, maxLength) {
        if (textarea && countElement) {
            textarea.addEventListener("input", function () {
                const remainingChars = this.value.length;
                countElement.textContent = remainingChars;

                if (remainingChars > maxLength) {
                    this.value = this.value.substring(0, maxLength);
                    countElement.textContent = maxLength;
                }
            });
        }
    }

    setupTextarea(reviewTextarea, reviewCharCount, 100);
    setupTextarea(descriptionTextarea, charCount, 500);
});
