function loadMapData() {
    return new Promise((resolve, reject) => {
        // Check if mapCampgrounds is already defined
        if (typeof mapCampgrounds !== "undefined") {
            resolve(mapCampgrounds);
        } else {
            // If not defined, use the default data loading logic
            setTimeout(() => {
                mapCampgrounds = [
                    /* your campgrounds data */
                ];
                resolve(mapCampgrounds);
            }, 1000);
        }
    });
}

function initMap() {
    // Check if mapCampgrounds data is available
    if (typeof mapCampgrounds === "undefined" || !mapCampgrounds) {
        console.error("Map Campgrounds data is not available");
        return;
    }

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
            const { id, title, location, price } = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup()
                .setLngLat(coordinates)
                .setHTML(
                    `
                    <h5>${title}</h5>
                    <p>${location}</p>
                    <p>€ ${price}/night</p>
                    <a href="/campgrounds/${id}" class="btn btn-secondary">View Park</a>
                `
                )
                .addTo(map);
        });

        map.on("mouseenter", "clusters", () => {
            map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", "clusters", () => {
            map.getCanvas().style.cursor = "";
        });
    });
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top < (window.innerHeight || document.documentElement.clientHeight)
    );
}

async function loadMapOnScroll() {
    const mapElement = document.getElementById("cluster-map");
    if (mapElement && isInViewport(mapElement) && !window.mapLoaded) {
        window.mapLoaded = true;
        try {
            await loadMapData();
            initMap();
        } catch (error) {
            console.error("Failed to load map data:", error);
        }
        window.removeEventListener("scroll", loadMapOnScroll);
    }
}

window.addEventListener("scroll", loadMapOnScroll);

document.addEventListener("DOMContentLoaded", async function () {
    if (document.getElementById("cluster-map")) {
        try {
            await loadMapData();
            initMap();
        } catch (error) {
            console.error("Failed to load map data:", error);
        }
    }
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

        // Initialize GSAP animation after Mapbox is loaded
        setupMapAnimation();
    };
    document.head.appendChild(script);
}

loadMapboxScript();

// At the end of the file
document.addEventListener("DOMContentLoaded", async function () {
    if (document.getElementById("cluster-map")) {
        try {
            await loadMapData();
            initMap();
            setupMapAnimation();
        } catch (error) {
            console.error("Failed to load map data:", error);
        }
    }
});

function setupMapAnimation() {
    const mapElement = document.getElementById("cluster-map");
    if (mapElement) {
        gsap.registerPlugin(ScrollTrigger);

        gsap.fromTo(
            mapElement,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                scrollTrigger: {
                    trigger: mapElement,
                    start: "top bottom-=100",
                    end: "bottom top+=100",
                    toggleActions: "play none none reverse",
                },
            }
        );
    }
}
