let imagesToPreload = [];

function preloadImages(images) {
    return Promise.all(
        images.map((src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = src;
            });
        })
    );
}

function showLoadingIndicator() {
    if (!document.getElementById("loading-indicator")) {
        const loadingIndicator = document.createElement("div");
        loadingIndicator.id = "loading-indicator";
        loadingIndicator.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loadingIndicator);
    }
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

function loadVisibleImages() {
    const visibleImages = Array.from(
        document.querySelectorAll("img[data-src]:not([src])")
    ).slice(0, 6); // Load 6 images at a time

    if (visibleImages.length > 0) {
        const visibleImageSrcs = visibleImages.map((img) => img.dataset.src);
        preloadImages(visibleImageSrcs)
            .then(() => {
                visibleImages.forEach((img) => {
                    img.src = img.dataset.src;
                    img.removeAttribute("data-src");
                });
                setTimeout(loadVisibleImages, 100); // Load next batch after a short delay
            })
            .catch((error) => {
                console.error("Error preloading images:", error);
            });
    }
}

function handleIntersection(entries, observer) {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            loadVisibleImages();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const imageObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute("data-src");
                    if (src) {
                        img.src = src;
                        img.removeAttribute("data-src");
                        img.classList.remove("lazy-image");
                        img.classList.add("loaded");
                        observer.unobserve(img);

                        // Remove the placeholder
                        const placeholder = img.previousElementSibling;
                        if (
                            placeholder &&
                            placeholder.classList.contains(
                                "lazy-image-placeholder"
                            )
                        ) {
                            placeholder.style.opacity = "0";
                            setTimeout(() => {
                                placeholder.remove();
                            }, 500);
                        }
                    }
                }
            });
        },
        {
            root: null,
            rootMargin: "0px",
            threshold: 0.1,
        }
    );

    function initializeLazyLoading() {
        const lazyImages = document.querySelectorAll("img.lazy-image");
        lazyImages.forEach((img) => {
            imageObserver.observe(img);
        });
    }

    initializeLazyLoading();

    // Expose the function for use in other scripts
    window.initializeNewImages = initializeLazyLoading;
});

// Add this function to handle dynamically loaded content
function initializeNewImages() {
    loadVisibleImages();
}
