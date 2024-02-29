const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const mongoose = require('mongoose');
const axios = require("axios")
require("dotenv").config();
const User = require('./models/model');


// Load environment variables (you can use 'dotenv' for this)
const { TELEGRAM_BOT_TOKEN, MONGODB_URI } = process.env;

          
let bot;
// Connect to MongoDB
mongoose.connect(MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

async function initializeBot() {
  try {
    // Fetch the bot details from the database
    const botDetails = await User.findOne({role :"admin" , telegramApiKey :{$exists:true}});
    if (botDetails) {
      // Initialize the Telegram bot with the fetched token


      // Add your bot's functionality here

      console.log('Telegram bot initialized successfully');
       return new TelegramBot(botDetails?.telegramApiKey||TELEGRAM_BOT_TOKEN, { polling: true });
    } else {
      console.error('Bot details not found in the database');
    }
  } catch (error) {
    console.error('Error initializing Telegram bot:', error);
  }
}

// Call the function to initialize the bot
 initializeBot().then((botInt)=>{
    require("./botMessages/botMessage")(botInt);
    bot = botInt
}).catch((error)=>{
  console.log(error);
});



const app = express();
const port = 3000;


app.use(express.urlencoded({ extended: true }));
app.use(express.json());




// Define routes and functionality

app.use("/api",require("./routes/route"))


const cron = require('node-cron');
const { formatWeatherMessage } = require('./helper/helper');
cron.schedule('0 6 * * *', () => {
  console.log('Running job daily at 6:00 AM');
    
});




let weatherUpdateJob; // Global variable to hold the cron job
let isWeatherUpdateRunning = false; // Global flag to control the cron job

async function startWeatherUpdateCron() {
  let timeFrequency = {
    "daily":"0 6 * * *",
     "hourly":"0 * * * *",
     "twice_daily":"0 6,18 * * *",
     "everyMinute": "* * * * *"
  }
  const user = await User.findOne({role:"admin"});

    if (isWeatherUpdateRunning) {
        // If a job is already running, don't start a new one
        console.log('Weather update cron job is already running.');
        return;
    }
    // Set up a new cron job with the specified frequency
    weatherUpdateJob = cron.schedule(`${timeFrequency[user?.messageFrequency]||timeFrequency["daily"]}`, async () => {
             console.log("hello after one mintue")
      const admin = await User.findOne({role:"admin", weatherApiKey: {$exists: true}});
      const weatherApiKey = admin?.weatherApiKey||process.env.weatherApiKey
      const usersList = await User.find({role:"user", isBlocked :false , isDeleted : false, isRegistered : true})
           usersList.forEach( async (user)=>{
            const weatherDetails = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${user?.city}&aqi=no`)
            // console.log("weatherDetails====>>>>", weatherDetails)
          const weather = formatWeatherMessage(weatherDetails.data);
            bot.sendMessage(user?.chatId,`Daily update. ${weather}`); 
           })
        console.log(`Running weather update task every ${timeFrequency[user?.messageFrequency]} minutes`);
        // Implement your weather update logic here
    });

    isWeatherUpdateRunning = true;
    console.log(`Weather update cron job started with frequency ${timeFrequency[user?.messageFrequency]||timeFrequency["daily"]} minutes`);
}

function stopWeatherUpdateCron() {
    if (weatherUpdateJob) {
        weatherUpdateJob.stop();
        isWeatherUpdateRunning = false;
        console.log('Weather update cron job stopped.');
    } else {
        console.log('No active weather update cron job to stop.');
    }
}

app.use((req,res , next)=>{
  console.log("hello from there")
  let endpoint = req.path.split("/");
  console.log(endpoint)
    if(endpoint[endpoint.length-1] === "updateMessageFreq"){
      console.log("hello")
      stopWeatherUpdateCron()
      startWeatherUpdateCron()
      next()
    } else{
      next()
    }
})

// Example: Start the cron job with a default frequency or adjust it later
startWeatherUpdateCron(); // Start with a default frequency of 60 minutes

// Example: Stop the cron job
stopWeatherUpdateCron();



// Start the Express app
app.listen(port, () => {
  console.log(`server is running at http://localhost:${port}`);
});



