const { createLogger, format, transports } = require("winston");

const logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "logs/error.log", level: "error" }),
        new transports.File({ filename: "logs/info.log", level: "info" }),   // 👈 needed so info logs are written
        // new transports.File({ filename: "app.log" })
    ],
});

module.exports = logger;
