const mongoose = require("mongoose");


const apiKeySchema = mongoose.Schema({
    weatherApiKey : {
        type : String
    },
    telegramApiKey : {
        type : String
    },
    weatherApiKey : {
        type : String
    }
} , {
    timestamps: true
})


module.exports = mongoose.model("apiKey", apiKeySchema)