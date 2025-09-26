const Order = require("../models/orderModel");

const getOrders = async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
};
const getOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findById(id);
  res.json(order);
};
const pushOrder = async (req, res) => {
  const { eventId, gig, name, email, count, type } = req.body;
  const order = await Order.create({ eventId, gig, name, email, count, type });
  res.status(201).json(order);
};

const deleteOrder = async (req, res) => {
  const { id } = req.params;
  const order = await Order.findByIdAndDelete(id);

  res.json(order);
};

module.exports = {
  getOrders,
  getOrder,
  pushOrder,
  deleteOrder,
};
