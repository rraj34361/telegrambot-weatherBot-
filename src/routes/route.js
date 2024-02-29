const express = require("express");
const { adminSignUp, adminLogin, unBlockUser, blockUser, updateMessageFreq, updateApiKeys } = require("../controllers/botController");
const { verifyTokenAndAdmin } = require("../middleware/auth");
const router = express.Router();


router.post("/adminSignUp", adminSignUp);
router.post("/adminLogin", adminLogin);
router.put("/blockUser/:id", verifyTokenAndAdmin, blockUser)
router.put("/unBlockUser/:id", verifyTokenAndAdmin, unBlockUser)
router.put("/updateMessageFreq", verifyTokenAndAdmin, updateMessageFreq)
router.put("/updateApiKeys", verifyTokenAndAdmin, updateApiKeys)
module.exports = router;
