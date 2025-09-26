const express = require("express");
const {
  getMessages,
  pushMessage,
  deleteMessage,
  getMessage,
} = require("../controllers/messageController");
const jsonParser = express.json();

const messageRouter = express.Router();

messageRouter.get("/", getMessages);
messageRouter.get("/:id", getMessage);
messageRouter.post("/", jsonParser, pushMessage);
messageRouter.delete("/:id", jsonParser, deleteMessage);

module.exports = messageRouter;
