const User = require("../models/model");
const { adminSchema } = require("../validation/validator");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const adminSignUp = async(req, res)=>{
    try {
        const {error} = adminSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message  : error.details[0].message
            })
        }
       const hashedPassword =  bcrypt.hashSync(req.body.password ,12 )
       req.body.password = hashedPassword;
        const adminCreate = await User.create({
             email : req.body.email,
             password: req.body.password,
             role: "admin"
        });

        return res.status(201).json({
            message:"admin signUp successfully",
            result : adminCreate
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : error.message
        })
    }
}



const adminLogin = async(req, res)=>{
    try {
        const {error} = adminSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                message  : error.details[0].message
            })
        }

        const  user = await User.findOne({ email: req.body.email, role: "admin"});
                if(!user){
                    return res.status(401).json({
                        message:"You are not admin"
                    })
                }
                
                const isMatched =  bcrypt.compare(req.body.password, user.password);
                if(!isMatched){
                    return res.status(401).json({
                        message:"Incorrect password"
                    })
                }  else{
                    const token = jwt.sign({
                        _id:user._id,
                        role:user.role
                    } , "helloworld", {expiresIn: "1d"})
                    return res.status(200).json({
                        message:"admin logged IN successfully",
                        result : {
                            token
                        }
                    })
                }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message : error.message
        })
    }
}


const blockUser =async(req , res)=>{
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id, {$set : {isBlocked : true}}, {new : true});

        if(!user){
            return res.status(404).json({
                message: "User Not Found"
            })
        }  else{
            return res.status(200).json({
                message: "User Blocked successfully"
            }) 
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            message:error.message
        })
    }
}

const unBlockUser =async(req , res)=>{
    try {
        const id = req.params.id;
        const user = await User.findByIdAndUpdate(id, {$set : {isBlocked : false}}, {new : true});

        if(!user){
            return res.status(404).json({
                message: "User Not Found"
            })
        }  else{
            return res.status(200).json({
                message: "User UnBlocked successfully"
            }) 
        }
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            message:error.message
        })
    }
}

const updateMessageFreq = async(req, res, next)=>{
    try {
        if(!req.body.messageFrequency){
            return res.status(404).json({
                message:"message frequency key is required"
            })
        } 
        const user = await User.findByIdAndUpdate(req.user._id, {$set: {messageFrequency: req.body.messageFrequency}});
        if(!user){
            return res.status(404).json({
                message:"Data Not Found"
            })
        } 
        else{
           res.status(200).json({
            message: "message frequency updated successfully"
          })
          next();
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:error.message
        })
    }
}

const updateApiKeys = async(req, res)=>{
    try {

        const {weatherApiKey , telegramApiKey} = req.body

        if(!weatherApiKey && !telegramApiKey){
            return res.status(400).json({
                message:"weatherApi or telegramApiKey is required"
            })
        } 
        const user = await User.findByIdAndUpdate(req.user._id, {$set: {weatherApiKey , telegramApiKey}})
        if(!user){
            return res.status(404).json({
                message:"Data Not Found"
            })
        } 
        else{
           res.status(200).json({
            message: "Api keys updated successfully",
            result:{
                telegramApiKey:user?.telegramApiKey,
                weatherApiKey:user?.weatherApiKey
            }
          })
          process.exit(0)
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:error.message
        })
    }
}




module.exports = {
    adminSignUp,
    adminLogin,
    blockUser,
    unBlockUser,
    updateMessageFreq,
    updateApiKeys
}