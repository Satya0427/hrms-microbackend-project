import { app } from './app';
import { server_connection } from './config/db_connections/mongodb';
import { env } from './config/env';
import logger from './config/logger';
import { redis_connection } from './config/db_connections/redisDb';

async function start_server(): Promise<void> {
    try {
        await server_connection();
        await redis_connection();

        console.log("All Db's are connected successfully");
        logger.info("All Db's are connected successfully");
        app.listen(env.PORT, () => {
            console.log(`Server is running in ${env.PORT}`)
            logger.info(`Server is running in ${env.PORT}`)
        })
    } catch (error) {
        console.log(`Error in starting the server ${error}`);
        logger.error(`Server is running in ${env.PORT}`)
    }
}

start_server();
