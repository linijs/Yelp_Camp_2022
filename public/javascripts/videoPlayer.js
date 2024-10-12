document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("bg-video");
    const heroSection = document.getElementById("hero-section");

    if (video) {
        // Function to play the video
        function playVideo() {
            video.play().catch((error) => {
                console.error("Error playing video:", error);
            });
        }

        // Try to play the video immediately
        playVideo();

        // If the video is paused after load, try playing again
        video.addEventListener("loadedmetadata", function () {
            heroSection.style.visibility = "visible";
            if (video.paused) {
                playVideo();
            }
        });

        // Handle user interaction to play video on mobile devices
        document.body.addEventListener(
            "touchstart",
            function () {
                if (video.paused) {
                    playVideo();
                }
            },
            { once: true }
        );

        video.addEventListener("timeupdate", function () {
            const buffer = 0.44; // Adjust this value if needed
            if (this.currentTime > this.duration - buffer) {
                this.style.opacity = 0;
            } else {
                this.style.opacity = 1;
            }
        });

        video.addEventListener("ended", function () {
            this.currentTime = 0;
            playVideo();
        });
    }
});
