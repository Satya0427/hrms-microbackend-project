const { app } = require('./app');
const { server_connection } = require('./config/db_connections/mongodb');
const { env } = require('./config/env');
const logger = require('./config/logger');
const {redis_connection} = require("./config/db_connections/redisDb")

async function start_server() {
    try {
        await server_connection();
        await redis_connection();

        console.log("All Db's are connected successfully");
        logger.info("All Db's are connected successfully");
        app.listen(env.PORT, (req, res) => {
            console.log(`Server is running in ${env.PORT}`)
            logger.info(`Server is running in ${env.PORT}`)
        })
    } catch (error) {
        console.log(`Error in starting the server ${error}`);
        logger.error(`Server is running in ${env.PORT}`)
    }
}
start_server();