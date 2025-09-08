const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { Log } = require("../logging-middleware/logger"); // <-- correct path
const urlRoutes = require("./routes/urlRoutes");
const logger = Log;
dotenv.config();
const app = express();

app.use(express.json());
app.use(logger);

app.use("/", urlRoutes);

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error("MongoDB connection error:", err));
