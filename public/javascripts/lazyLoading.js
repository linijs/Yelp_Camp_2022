document.addEventListener("DOMContentLoaded", function () {
    let lazyImages = [].slice.call(document.querySelectorAll("img.lazy-image"));

    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function (
            entries,
            observer
        ) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove("lazy-image");
                    lazyImage.classList.add("loaded");
                    lazyImageObserver.unobserve(lazyImage);

                    // Remove the placeholder
                    let placeholder = lazyImage.previousElementSibling;
                    if (
                        placeholder &&
                        placeholder.classList.contains("lazy-image-placeholder")
                    ) {
                        placeholder.style.opacity = "0";
                        setTimeout(() => {
                            placeholder.remove();
                        }, 500); // Match this to the transition time in CSS
                    }
                }
            });
        });

        lazyImages.forEach(function (lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Fallback for browsers that don't support IntersectionObserver
        let active = false;

        const lazyLoad = function () {
            if (active === false) {
                active = true;

                setTimeout(function () {
                    lazyImages.forEach(function (lazyImage) {
                        if (
                            lazyImage.getBoundingClientRect().top <=
                                window.innerHeight &&
                            lazyImage.getBoundingClientRect().bottom >= 0 &&
                            getComputedStyle(lazyImage).display !== "none"
                        ) {
                            lazyImage.src = lazyImage.dataset.src;
                            lazyImage.classList.remove("lazy-image");
                            lazyImage.classList.add("loaded");

                            // Remove the placeholder
                            let placeholder = lazyImage.previousElementSibling;
                            if (
                                placeholder &&
                                placeholder.classList.contains(
                                    "lazy-image-placeholder"
                                )
                            ) {
                                placeholder.style.opacity = "0";
                                setTimeout(() => {
                                    placeholder.remove();
                                }, 500); // Match this to the transition time in CSS
                            }

                            lazyImages = lazyImages.filter(function (image) {
                                return image !== lazyImage;
                            });

                            if (lazyImages.length === 0) {
                                document.removeEventListener(
                                    "scroll",
                                    lazyLoad
                                );
                                window.removeEventListener("resize", lazyLoad);
                                window.removeEventListener(
                                    "orientationchange",
                                    lazyLoad
                                );
                            }
                        }
                    });

                    active = false;
                }, 200);
            }
        };

        document.addEventListener("scroll", lazyLoad);
        window.addEventListener("resize", lazyLoad);
        window.addEventListener("orientationchange", lazyLoad);
    }
});
