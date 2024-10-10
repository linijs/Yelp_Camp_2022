require("dotenv").config();
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");

require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const options = {
    type: "upload",
    prefix: "Terrainly/Parks/",
    max_results: 500,
};

mongoose.set("strictQuery", false);
mongoose
    .connect(dbUrl, {
        serverSelectionTimeoutMS: 10000,
    })
    .then(() => {
        console.log(`Connected to database: ${mongoose.connection.name}`);
        return seedDB(); // Call seedDB() after successful connection
    })
    .then(() => {
        console.log("Database seeded successfully");
        mongoose.connection.close();
    })
    .catch((e) => {
        console.log("Database error:", e.message);
        console.error("Connection error:", e);
    });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const generateRandomDescription = () => {
    const intros = [
        "Escape to a hidden gem in the wilderness.",
        "Discover nature's playground at our unique campground.",
        "Experience the great outdoors like never before.",
        "Unwind in a serene natural paradise.",
        "Adventure awaits at this picturesque camping destination.",
    ];

    const locations = [
        "Nestled in the heart of lush forests",
        "Perched on the edge of crystal-clear lakes",
        "Surrounded by majestic mountain peaks",
        "Tucked away in a tranquil valley",
        "Sprawling across pristine meadows",
    ];

    const features = [
        "towering redwoods",
        "babbling brooks",
        "diverse wildlife",
        "colorful wildflowers",
        "ancient rock formations",
        "misty waterfalls",
        "panoramic vistas",
        "secluded coves",
        "rolling hills",
    ];

    const activities = [
        "hiking scenic trails",
        "fishing in stocked ponds",
        "kayaking through gentle rapids",
        "bird watching rare species",
        "stargazing under clear skies",
        "rock climbing challenging cliffs",
        "mountain biking on rugged terrain",
        "horseback riding",
        "photographing breathtaking landscapes",
    ];

    const amenities = [
        "well-maintained campsites",
        "modern restroom facilities",
        "convenient picnic areas",
        "informative nature center",
        "friendly staff",
        "on-site general store",
        "fire pits and grills",
        "hot showers",
        "RV hookups",
        "guided tours",
    ];

    const closings = [
        "Your perfect outdoor getaway awaits!",
        "Create unforgettable memories in nature's embrace.",
        "Reconnect with nature and yourself.",
        "The ultimate camping experience for all ages.",
        "Your adventure begins here!",
    ];

    const randomNumber = (max) => Math.floor(Math.random() * max) + 1;

    const description = `
        ${sample(intros)} ${sample(
        locations
    )}, this campground offers a truly unique outdoor experience. 
        ${
            sample(features).charAt(0).toUpperCase() + sample(features).slice(1)
        } and ${sample(features)} create a stunning backdrop for your stay. 
        Enjoy activities like ${sample(activities)} and ${sample(activities)}. 
        ${
            randomNumber(3) > 1
                ? `For the adventurous, try ${sample(activities)} or ${sample(
                      activities
                  )}. `
                : ""
        }
        This campground features ${sample(amenities)} and ${sample(amenities)}${
        randomNumber(2) === 1 ? `, as well as ${sample(amenities)}` : ""
    }. 
        ${
            randomNumber(2) === 1
                ? `Nature enthusiasts will appreciate the abundant ${sample(
                      features
                  )} in the area. `
                : ""
        }
        ${sample(closings)}
    `
        .replace(/\s+/g, " ")
        .trim();

    return description;
};

const seedDB = async () => {
    try {
        await Campground.deleteMany({});
        console.log("Deleted existing campgrounds");

        const images = [];
        const result = await cloudinary.api.resources(options);
        result.resources.forEach((asset) => {
            images.push({
                url: asset.secure_url,
                filename: asset.public_id,
            });
        });
        console.log(`Fetched ${images.length} images from Cloudinary`);

        const campgrounds = [];
        for (let i = 0; i < 100; i++) {
            const random60 = Math.floor(Math.random() * 60);
            const price = Math.floor(Math.random() * 20) + 10;

            const numberOfImages = Math.floor(Math.random() * 4) + 1;
            const campgroundImages = [];
            for (let i = 0; i <= numberOfImages; i++) {
                const img =
                    images[
                        Math.floor(Math.random() * images.length) %
                            images.length
                    ];
                if (
                    campgroundImages.find((im) => im.url === img.url) !==
                    undefined
                )
                    i--;
                else campgroundImages.push(img);
            }

            const camp = new Campground({
                //YOUR USER ID
                author: "67083b7d6b71b17be2d3655d",
                location: `${cities[random60].city}, ${cities[random60].state}`,
                title: `${sample(descriptors)} ${sample(places)}`,
                description: generateRandomDescription(),
                price,
                geometry: {
                    type: "Point",
                    coordinates: [
                        cities[random60].longitude,
                        cities[random60].latitude,
                    ],
                },

                images: campgroundImages,
            });
            campgrounds.push(camp);
        }

        await Campground.insertMany(campgrounds);
        console.log(`Created ${campgrounds.length} new campgrounds`);
    } catch (error) {
        console.error("Error seeding database:", error);
    }
};
