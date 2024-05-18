const mongoose = require('mongoose');
require('dotenv').config();
const { chalkcolor } = require('../utils/color')



module.exports = (config) => {
    mongoose.set("strictQuery", true);
    mongoose.connect(config.MongoURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log(chalkcolor.green("Connected to the database!"));

    }
    ).catch((err) => {
        console.log(chalkcolor.red("Unable to connect to the database!", err));
    }
    )
}

