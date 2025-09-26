const express = require("express");
const {
  getOrders,
  pushOrder,
  deleteOrder,
  getOrder,
} = require("../controllers/ordersController");
const jsonParser = express.json();

const orderRouter = express.Router();

orderRouter.get("/", getOrders);
orderRouter.get("/:id", getOrder);
orderRouter.post("/", jsonParser, pushOrder);
orderRouter.delete("/:id", jsonParser, deleteOrder);

module.exports = orderRouter;
