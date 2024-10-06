const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary"); //node automatically searches for an index file
const upload = multer({ storage });

const Campground = require("../models/campground");

router.get(
    "/",
    catchAsync(async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 9; // Number of campgrounds per page

            const options = {
                page: page,
                limit: limit,
                sort: { _id: -1 }, // Sort by newest first
            };

            const campgrounds = await Campground.paginate({}, options);
            console.log("Campgrounds object:", campgrounds);
            res.render("campgrounds/index", { campgrounds });
        } catch (error) {
            console.error("Error fetching campgrounds:", error);
            res.status(500).render("error", {
                error: "Failed to load campgrounds",
            });
        }
    })
);

router
    .route("/")
    .get(catchAsync(campgrounds.index))
    .post(
        isLoggedIn,
        upload.array("image"),
        validateCampground,
        catchAsync(campgrounds.createCampground)
    );
// .post(upload.array("image"), (req, res) => {
//     console.log(req.body, req.files);
//     res.send("It worked!");
// });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
    .route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(
        isLoggedIn,
        isAuthor,
        upload.array("image"),
        validateCampground,
        catchAsync(campgrounds.updateCampground)
    )
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
