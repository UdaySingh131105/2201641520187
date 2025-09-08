// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const { Log } = require("../logging-middleware/logger"); // <-- correct path
// const urlRoutes = require("./routes");
// const logger = Log;
// dotenv.config();
// const app = express();

// app.use(express.json());
// // app.use(logger);

// app.use("/", routes);

// const PORT = process.env.PORT || 5000;

// // mongoose
// //     .connect(process.env.MONGO_URI)
// //     .then(() => {
// //         console.log("MongoDB Connected");
// //         app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// //     })
// //     .catch((err) => console.error("MongoDB connection error:", err));

// app.use("/", routes);

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on http://localhost:${PORT}`);
// });

const express = require("express");
// const logger = require("./middleware/logger");
const routes = require("./routes");

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json()); // for parsing JSON
// app.use(logger); // custom logger middleware

// Routes
app.use("/", routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
