const mongoose = require('mongoose');
require('dotenv').config();

module.exports = (config) => {
    mongoose.set("strictQuery", true);
    mongoose.connect(config.MongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Connected to the database!");
    }
    ).catch((err) => {
        console.log("Unable to connect to the database!", err);
    }
    )
}

