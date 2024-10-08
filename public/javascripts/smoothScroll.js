document.addEventListener("DOMContentLoaded", () => {
    const scroll = new LocomotiveScroll({
        el: document.querySelector("[data-scroll-container]"),
        smooth: true,
        multiplier: 0.8,
        lerp: 0.01,
    });

    // Initialize ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Update ScrollTrigger when locomotive scroll updates
    scroll.on("scroll", ScrollTrigger.update);

    // Tell ScrollTrigger to use these proxy methods for the ".smooth-scroll" element
    ScrollTrigger.scrollerProxy("[data-scroll-container]", {
        scrollTop(value) {
            return arguments.length
                ? scroll.scrollTo(value, 0, 0)
                : scroll.scroll.instance.scroll.y;
        },
        getBoundingClientRect() {
            return {
                top: 0,
                left: 0,
                width: window.innerWidth,
                height: window.innerHeight,
            };
        },
        pinType: document.querySelector("[data-scroll-container]").style
            .transform
            ? "transform"
            : "fixed",
    });

    // Refresh ScrollTrigger and update locomotive scroll after the page content updates
    ScrollTrigger.addEventListener("refresh", () => scroll.update());

    // After everything is set up, refresh ScrollTrigger
    ScrollTrigger.refresh();
});
