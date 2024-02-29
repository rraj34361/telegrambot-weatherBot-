const { formatWeatherMessage, fetchCities } = require("../helper/helper");
const User = require("../models/model")
const axios = require("axios");

module.exports = function(bot){
// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
  
    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"
  
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
  });
  
  // Listen for any kind of message. There are different kinds of
  // messages.
  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
      try {
      //  console.log("msg====>>>>>>",msg)
       const id = msg.from.id;
       const userWithChatId = await User.findOne({
        chatId : id,
       });
      //  console.log(userWithChatId,"User");
       if(userWithChatId){
           if(userWithChatId.isBlocked){
            bot.sendMessage(chatId, "Your account has been blocked. Contact admin. @weatherforcast_bot");
             return ;
           }
            let message = {
                message: msg.text,
                from:"user"
            }
            userWithChatId.chat.push(message);
            await userWithChatId.save();
            if(userWithChatId.chat.length - 1 === 1){
                 userWithChatId.name = msg.text;
                 await userWithChatId.save();
                 bot.sendMessage(chatId, `Hey ${userWithChatId.name}! What is your country's name.`);
     
              return;
            }
            if(userWithChatId.chat.length - 1 === 2){
              userWithChatId.country = msg.text;
              await userWithChatId.save();
              bot.sendMessage(chatId,`What is your city's name.`);
              return;
            }

            if(userWithChatId.chat.length - 1 >=3){
                if(userWithChatId.chat.length - 1 === 3){
                     const response = await fetchCities()
                     const filteredCities = response.data.filter((item) => {
                      if (
                        item.name.toUpperCase().includes(msg.text.toUpperCase()) ||
                        item.state.toUpperCase().includes(msg.text.toUpperCase())
                      ) {
                        return item;
                      }
                    });
                      if(filteredCities.length===0){
                        console.log(userWithChatId?.chat[3]?._id)
                        const chatIdPull = userWithChatId?.chat[3]?._id
                        const chats = userWithChatId.chat.filter((item)=>item._id !== chatIdPull)
                           const userUpdate = await User.findByIdAndUpdate(userWithChatId._id, {$set :{ chat:chats}})
                          bot.sendMessage(chatId,'City not found. please Enter correct city.');
                         return; 
                      }
                  userWithChatId.city = msg.text;
              await userWithChatId.save();
                }
                const userWithKey = await User.findOne({role:"admin", weatherApiKey:  {$exists: true}});
                const weatherApiKey = userWithKey?.weatherApiKey || process.env.weatherApiKey
              const weatherDetails = await axios.get(`https://api.weatherapi.com/v1/current.json?key=${weatherApiKey}&q=${msg.text}&aqi=no`)
              // console.log("weatherDetails====>>>>", weatherDetails)
            const weather = formatWeatherMessage(weatherDetails.data);
                if(!userWithChatId.isRegistered){
                  userWithChatId.isRegistered = true;
                  await  userWithChatId.save();
                }
              bot.sendMessage(chatId,`Thankyou for using the weatherforcastbot. Here I will provide you daily updates for your city. Here for today. ${weather}`); 
            }
       } else{
         const  newUser = await User.create({
            firstName : msg.from.first_name,
            lastName : msg.from.last_name,
            chatId:chatId,
            chat : [
              {
                message: msg.text,
                from:"user"
              }
            ]
         })
         bot.sendMessage(chatId, 'what is your name');
       }
    // bot.sendMessage(chatId, 'Received your message');
        
      } catch (error) {
        console.log(error);
        console.log(error.response.data)

        bot.sendMessage(chatId, error?.response?.data?.error?.message || "something went wrong")
      }
  });
  }
