function initShowPageMap() {
    if (
        !campground ||
        !campground.geometry ||
        !campground.geometry.coordinates
    ) {
        console.error("Campground data is not available or invalid");
        showMapError();
        return;
    }

    mapboxgl.accessToken = mapToken;

    try {
        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/dark-v10",
            center: campground.geometry.coordinates,
            zoom: 10,
        });

        // Set willReadFrequently attribute on the canvas
        const canvas = map.getCanvas();
        canvas.setAttribute("willReadFrequently", "true");

        map.addControl(new mapboxgl.NavigationControl());

        new mapboxgl.Marker()
            .setLngLat(campground.geometry.coordinates)
            .setPopup(
                new mapboxgl.Popup({
                    offset: 25,
                    className: "custom-popup",
                }).setHTML(
                    `<h3>${campground.title}</h3><p>${campground.location}</p>`
                )
            )
            .addTo(map);
    } catch (error) {
        console.error("Error initializing map:", error);
        showMapError();
    }
}

function showMapError() {
    document.getElementById("map").style.display = "none";
    document.getElementById("map-error").classList.remove("d-none");
}

document.addEventListener("DOMContentLoaded", initShowPageMap);
