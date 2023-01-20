const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const options = {
    resource_type: "image",
    max_results: 500,
};

mongoose.set("strictQuery", false);
mongoose
    .connect(dbUrl)
    .then(() => {
        console.log("database connected");
    })
    .catch((e) => {
        console.log("database error");
        console.error.bind(console, "connection error:");
    });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});

    const images = [];
    await cloudinary.api.resources(options).then((res) => {
        res.resources.forEach((asset) => {
            if (asset.folder === "YelpCamp")
                images.push({
                    url: asset.secure_url,
                    filename: asset.public_id,
                });
        });
        //    console.log('here', images)
    });

    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;

        const numberOfImages = Math.floor(Math.random() * 4) + 1;
        const campgroundImages = [];
        for (let i = 0; i <= numberOfImages; i++) {
            const img =
                images[
                    Math.floor(Math.random() * images.length) % images.length
                ];
            if (campgroundImages.find((im) => im.url === img.url) !== undefined)
                i--;
            else campgroundImages.push(img);
        }

        const camp = new Campground({
            //YOUR USER ID
            // author: "626400f4ecc0a95c043abb2e",
            author: "63c9535b1b3d3de42de66c3a",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            // image: "https://source.unsplash.com/collection/483251",
            description:
                'You may be wondering, "What are the best places to camp near me?" One of the greatest things about traveling around the U.S. is that from coast to coast, theres really no shortage of beautiful places to camp. Nature lovers can enjoy fresh air, glorious mountains, and clear lakes and streams during a weekend (or longer) camping trip. Not only can you set up a tent at these picturesque locations, they also come with plenty of picnic areas, hiking trails, and ample opportunities for fishing, swimming, and other outdoor activities in the great wide wilderness. From scenic forests in Maine to peaceful beaches in Florida and majestic mountains in Alaska, these are some of the most beautiful places to camp in the U.S.',
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ],
            },

            // image: imageUrls[Math.floor(Math.random() * imageUrls.length)],
            images: campgroundImages,

            // images: [
            //     {
            //         url: "https://res.cloudinary.com/drvf1bwps/image/upload/v1651012681/YelpCamp/oavnfk5fdftyeu2zivoj.jpg",
            //         filename: "YelpCamp/woavnfk5fdftyeu2zivoj",
            //     },
            //     {
            //         url: "https://res.cloudinary.com/drvf1bwps/image/upload/v1651014353/YelpCamp/h2r9ygtjpnutbwxduqx2.jpg",
            //         filename: "YelpCamp/h2r9ygtjpnutbwxduqx2",
            //     },
            //     {
            //         url: "https://res.cloudinary.com/drvf1bwps/image/upload/v1650889915/YelpCamp/yqfep7h9fdcatpfx3iyz.jpg",
            //         filename: "YelpCamp/yqfep7h9fdcatpfx3iyz",
            //     },
            //     {
            //         url: "https://res.cloudinary.com/drvf1bwps/image/upload/v1650889916/YelpCamp/pmq175w1g845fzcmofex.jpg",
            //         filename: "YelpCamp/pmq175w1g845fzcmofex",
            //     },
            // ],
        });
        await camp.save();
    }
    // const c = new Campground({ title: "purple field" });
    // await c.save();
};

seedDB().then(() => {
    mongoose.connection.close();
});
