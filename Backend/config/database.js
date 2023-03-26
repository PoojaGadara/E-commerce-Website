const mongoose = require('mongoose')

const DataBaseConnection = () => {
    mongoose.connect(process.env.DB_Url,{
        useUnifiedTopology:true,
        useNewUrlParser: true,
    }).then((data) => {
        console.log(`mongoDB connect with host:${data.connection.host}`)
    })
}

module.exports = DataBaseConnection