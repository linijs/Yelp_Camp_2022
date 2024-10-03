# YelpCamp

**YelpCamp** is a **full-stack web application** that allows users to **discover**, **create**, and **review camping sites** around the world. This application leverages **Node.js**, **Express**, and **MongoDB** to deliver a **robust** and **interactive user experience** with features like **user authentication**, **campground management**, and a **review system**.

## Features

- User registration and authentication
- Create, read, update, and delete (CRUD) campgrounds
- Leave reviews and ratings for campgrounds
- Image upload functionality with **Cloudinary**
- Interactive map integration using **Mapbox**
- Responsive design using **Bootstrap**

## Technologies Used

- **Backend**:
  - Node.js
  - Express
  - MongoDB (with Mongoose)
- **Frontend**:
  - EJS (Embedded JavaScript)
  - Bootstrap 5
  - CSS
- **Authentication**:
  - Passport.js
- **File Uploads**:
  - Multer
  - Cloudinary
- **Mapping**:
  - Mapbox API
- **Deployment**:
  - Heroku

## Usage
1. Register for a new account or log in to an existing account.
2. Browse through available campgrounds.
3. Create a new campground by providing details and uploading images.
4. Leave reviews and ratings on campgrounds you've visited.
5. Edit or delete your own campgrounds and reviews.

## Installation

To run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/lmeisters/Yelp_Camp_2022.git

   cd Yelp_Camp_2022
2. Install dependencies:
    ```bash 
    npm install

3. Set up environment variables: Create a .env file in the root directory and add the following:
    ```bash 
    DATABASE_URL=your_mongodb_connection_string
    CLOUDINARY_URL=your_cloudinary_url
    SESSION_SECRET=your_session_secret
    MAPBOX_ACCESS_TOKEN=your_mapbox_access_token
4. Start the server:
    ```bash 
    npm start

5. Visit the application in your browser:
    ```bash 
    http://localhost:3000
