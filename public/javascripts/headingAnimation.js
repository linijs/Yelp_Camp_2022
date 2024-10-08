function initHeadingAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    const headings = document.querySelectorAll("[data-animate-heading]");

    headings.forEach((heading) => {
        heading.innerHTML = heading.textContent.replace(
            /\S+/g,
            "<span class='word-wrapper'><span class='animate-text'>$&</span></span>"
        );

        gsap.from(heading.querySelectorAll(".animate-text"), {
            scrollTrigger: {
                trigger: heading,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse",
            },
            y: "100%",
            stagger: 0.1,
            duration: 0.8,
            ease: "power2.out",
        });
    });
}

function initElementAnimations(selector, staggerDelay = 0.2) {
    gsap.registerPlugin(ScrollTrigger);

    const elements = document.querySelectorAll(selector);

    elements.forEach((element, index) => {
        const delay = element.dataset.delay
            ? parseFloat(element.dataset.delay) / 1000
            : index * staggerDelay;

        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 90%",
                end: "bottom 60%",
                toggleActions: "play none none reverse",
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power2.out",
            delay: delay,
        });
    });
}

function initCardAnimations(selector = ".popular-park-card") {
    initElementAnimations(selector);
}

document.addEventListener("DOMContentLoaded", () => {
    initHeadingAnimations();
    initCardAnimations();
    initCardAnimations(".animate-card");
});
