const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const corsOptions = {
  origin: true, // Replace with your frontend's origin
  methods: "GET,POST,DELETE,PUT,PATCH",
  credentials: true, // Allow credentials (cookies) to be sent
  optionsSuccessStatus: 204,
};

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
const mongoSanitize = require("express-mongo-sanitize");
const sanitizer = mongoSanitize({
  onSanitize: ({ req, key }) => {
    // Throw an error
    // Catch with express error handler
    console.log(req, key);
  },
});


app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
// app.use(limiter);
app.use(sanitizer);

const adminRouter = require("./routes/adminRouter");
const dataRouter = require("./routes/dataRouter");
const userRouter = require("./routes/userRouter");

app.use("/admins", adminRouter);
app.use("/data", dataRouter);
app.use("/users", userRouter);





mongoose
  .connect(process.env.DB_URL, {})
  .then(() => console.log("Connected To MongoDB"))
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err.stack);
    process.exit(1);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on: ${PORT}`);
});
