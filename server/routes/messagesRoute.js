const router = require("express").Router();
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const authMiddleware = require("../middlewares/authMiddleware");
const multer = require('multer');


// new message
const MIME_TYPE_MAP = {
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) =>{
    const isValid =  MIME_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mini type");
    if(isValid){
       error = null;
    }
    cb(error, "server/files");
  },
   filename: (req,file,cb) =>{
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now()+ '.' + ext);
 }
});

router.post("/new-message", multer({storage: storage}).single("image"),async (req, res) => {
  const url = req.protocol + '://' + req.get("host");
  try {
    // store message
    if(req.file){ 
      const newMessage = new Message({
        chat: req.body.chat,
        sender: req.body.sender,
        text: req.body.text,
        image: url + "/files/"+req.file.filename,
        // read: req.body.read
       });
    console.log('req.body',newMessage)
    const savedMessage = await newMessage.save();

    // update last message of chat
    await Chat.findOneAndUpdate(
      { _id: req.body.chat },
      {
        lastMessage: savedMessage._id,
        $inc: { unreadMessages: 1 },
      }
    );

    res.send({
      success: true,
      message: "Message sent successfully",
      data: savedMessage,
    });
      }else {
        const newMessage = new Message({
          chat: req.body.chat,
          sender: req.body.sender,
          text: req.body.text,
          image: '',
        //  read: req.body.read
        });
      console.log('req.body',newMessage)
      const savedMessage = await newMessage.save();
  
      // update last message of chat
      await Chat.findOneAndUpdate(
        { _id: req.body.chat },
        {
          lastMessage: savedMessage._id,
          $inc: { unreadMessages: 1 },
        }
      );
  
      res.send({
        success: true,
        message: "Message sent successfully",
        data: savedMessage,
      });
      }
   
  } catch (error) {
    res.send({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
});

// get all messages of a chat

router.get("/get-all-messages/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({
      chat: req.params.chatId,
    }).sort({ createdAt: 1 });
    res.send({
      success: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    res.send({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    });
  }
});

router.delete("/:id", (req, res, next) => {
  Message.deleteOne({ _id: req.params.id })
  .then(result => {
     console.log('633',result);
    // res.status(200).json({message: "Post deleted!"});
     res.send({
      success: true,
      message: "Message deleted",
    });
  });
});

module.exports = router;
