const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');

// module imports
const mainRoute = require('./modules/main.router');
const { wrongRouteErrorCatch, globalErrorCatch } = require('./common/middleware/error.middleware.ts');

const app = express();
app.use(express.urlencoded({ extended: true }));  // This is used for to understand the request body in urlencoded format

app.use(cors({
    origin: [
        "http://localhost:4201",
        "http://localhost:4200",
        "http://192.168.0.8:4201"
    ],
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    maxAge: 3600,
    optionsSuccessStatus: 200,
}))
// app.options("*", cors());

app.use(cookieParser());
app.use(express.json());    // This is used for to understand the request body in json format


app.use('/api', mainRoute);
app.use(wrongRouteErrorCatch);  /* Handling Invalid Routes Here */
app.use(globalErrorCatch);     /* Global Error Handler should always be at last */

module.exports = { app };