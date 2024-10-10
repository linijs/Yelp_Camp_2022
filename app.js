const Campground = require("./models/campground");

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const cookieSession = require("cookie-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const helmet = require("helmet");

const mongoSanitize = require("express-mongo-sanitize");

const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

mongoose.set("strictQuery", false);

const MongoStore = require("connect-mongo");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/test";

mongoose
    .connect(dbUrl, {
        serverSelectionTimeoutMS: 5000,
        tls: true,
    })
    .then(() => {
        console.log(`Connected to database: ${mongoose.connection.name}`);
        console.log(`Database host: ${mongoose.connection.host}`);
    })
    .catch((e) => {
        console.log("Database connection error:", e.message);
        console.error("Connection error:", e);
    });

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Move session configuration here, before other middleware
const sessionConfig = {
    name: "session",
    keys: [process.env.SECRET || "thisshouldbeabettersecret!"],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

app.use(cookieSession(sessionConfig));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// const store = MongoStore.create({
//     mongoUrl: dbUrl,
//     // secret: process.env.SECRET || "thisshouldbeabettersecret!",
//     touchAfter: 24 * 60 * 60,
//     crypto: {
//         secret: process.env.SECRET || "thisshouldbeabettersecret!",
//     },
// });

// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e);
// });

app.use(flash());

app.use(
    mongoSanitize({
        replaceWith: "_",
    })
);

app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: [
                "'self'",
                "https://*.mapbox.com",
                "https://*.cloudinary.com",
            ],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://*.cloudinary.com",
                "https://*.mapbox.com",
            ],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https://*.cloudinary.com",
                "https://*.mapbox.com",
            ],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "https://fonts.googleapis.com",
            ],
        },
    })
);

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/drvf1bwps/",
    "https://events.mapbox.com/",
];

const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];

const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
];

const fontSrcUrls = ["https://fonts.gstatic.com/", "https://cdn.jsdelivr.net/"];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drvf1bwps/",
                "https://images.unsplash.com/",
                "https://api.mapbox.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            mediaSrc: ["'self'", "https://res.cloudinary.com/drvf1bwps/"],
            childSrc: ["blob:"],
        },
        crossOriginEmbedderPolicy: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success") || [];
    res.locals.error = req.flash("error") || [];
    next();
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const campgrounds = await Campground.paginate(
            {},
            {
                page,
                limit,
                sort: "-createdAt",
                select: "title location description images geometry price",
            }
        );

        // Transform campgrounds into GeoJSON format for the map
        const mapCampgrounds = {
            features: campgrounds.docs.map((camp) => ({
                type: "Feature",
                geometry: camp.geometry,
                properties: {
                    id: camp._id,
                    title: camp.title,
                    description: camp.description,
                    location: camp.location,
                    price: camp.price,
                },
            })),
        };

        res.render("home", {
            campgrounds: campgrounds,
            mapCampgrounds: mapCampgrounds,
            currentPage: campgrounds.page,
            pages: campgrounds.totalPages,
            totalDocs: campgrounds.totalDocs,
            page: "home",
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching campgrounds");
    }
});

// 404 handler
app.use((req, res, next) => {
    const err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving at http://localhost:${port}`);
});

app.get("/public/images/favicon.png", (req, res) => res.status(204));

app.use((req, res, next) => {
    res.removeHeader("Cross-Origin-Embedder-Policy");
    next();
});

app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "images", "favicon.png"));
});

module.exports = app;
