document.addEventListener("DOMContentLoaded", () => {
    const parallaxWrappers = document.querySelectorAll(".parallax-wrapper");

    parallaxWrappers.forEach((wrapper) => {
        const image = wrapper.querySelector(".parallax-image");

        gsap.to(image, {
            y: "-50%",
            ease: "none",
            scrollTrigger: {
                trigger: wrapper,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
                scroller: "[data-scroll-container]",
            },
        });
    });
});
