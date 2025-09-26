const Message = require("../models/messageModel");

const getMessages = async (req, res) => {
  const messages = await Message.find();
  res.json(messages);
};

const getMessage = async (req, res) => {
  const { id } = req.params;
  const message = await Message.findById(id);
  res.json(message);
};

const pushMessage = async (req, res) => {
  try {
    const { name, email } = req.body;
    const message = (req.body.message ?? "").trim();

    const doc = await Message.create({ name, email, message });
    res.status(201).json(doc);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error" });
  }
};

const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const message = await Message.findByIdAndDelete(id);
  res.json(message);
};

module.exports = { getMessages, getMessage, pushMessage, deleteMessage };
