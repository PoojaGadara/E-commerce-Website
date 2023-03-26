const app = require('./app')
require('dotenv').config({ path: "../Backend/config/config.env" });
const DataBaseConnection = require('../Backend/config/database')

//Database connection 
DataBaseConnection();

const server =app.listen(process.env.PORT,() => {
    console.log(`server is running at ${process.env.PORT}`)
})

//unhandle Promise Rejetion
process.on('uncaughtException',err => {
    console.log(`Error ${err.message}`);
    console.log('shutting down the servern due to the unhandled Promise Rejection')
    server.close(() => {
        process.exit(1)
    });
});