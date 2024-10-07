function initMap() {
    mapboxgl.accessToken = mapToken;

    const map = new mapboxgl.Map({
        container: "cluster-map",
        style: "mapbox://styles/mapbox/dark-v10",
        center: [24.6032, 56.8796],
        zoom: 7,
    });

    map.addControl(new mapboxgl.NavigationControl());

    map.on("load", () => {
        // Check if mapCampgrounds data is available
        if (typeof mapCampgrounds === "undefined" || !mapCampgrounds) {
            console.error("Map Campgrounds data is not available");
            return;
        }

        map.addSource("campgrounds", {
            type: "geojson",
            data: mapCampgrounds,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 75,
        });

        map.addLayer({
            id: "clusters",
            type: "circle",
            source: "campgrounds",
            filter: ["has", "point_count"],
            paint: {
                "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#67b99a",
                    20,
                    "#469d89",
                    50,
                    "#248277",
                ],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    20,
                    30,
                    50,
                    40,
                ],
            },
        });

        map.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "campgrounds",
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12,
            },
        });

        map.addLayer({
            id: "unclustered-point",
            type: "circle",
            source: "campgrounds",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": "#11b4da",
                "circle-radius": 10,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff",
            },
        });

        map.on("click", "clusters", (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ["clusters"],
            });
            const clusterId = features[0].properties.cluster_id;
            map.getSource("campgrounds").getClusterExpansionZoom(
                clusterId,
                (err, zoom) => {
                    if (err) return;

                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom,
                    });
                }
            );
        });

        map.on("click", "unclustered-point", (e) => {
            const { popUpMarkup } = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(popUpMarkup)
                .addTo(map);
        });

        map.on("mouseenter", "clusters", () => {
            map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", () => {
            map.getCanvas().style.cursor = "";
        });

        document.getElementById("cluster-map").style.opacity = "1";
    });
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top < (window.innerHeight || document.documentElement.clientHeight)
    );
}

function loadMapOnScroll() {
    const mapElement = document.getElementById("cluster-map");
    if (mapElement && isInViewport(mapElement) && !window.mapLoaded) {
        window.mapLoaded = true;
        // Ensure campgrounds data is available before initializing the map
        if (typeof campgrounds !== "undefined" && campgrounds) {
            initMap();
        } else {
            console.error("Campgrounds data is not available");
        }
        window.removeEventListener("scroll", loadMapOnScroll);
    }
}

window.addEventListener("scroll", loadMapOnScroll);

document.addEventListener("DOMContentLoaded", () => {
    loadMapOnScroll();
    window.dispatchEvent(new Event("scroll"));
});

function loadMapboxScript() {
    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.js";
    script.async = true;
    script.onload = function () {
        const link = document.createElement("link");
        link.href = "https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        const style = document.createElement("style");
        style.textContent = `
            #cluster-map {
                opacity: 0;
                transition: opacity 1s ease-in-out;
            }
        `;
        document.head.appendChild(style);
    };
    document.head.appendChild(script);
}

loadMapboxScript();

// At the end of the file
document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("cluster-map")) {
        initMap();
    }
});
