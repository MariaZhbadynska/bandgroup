const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

const ordersRoutes = require("./routes/orderRouter");
const basicAuth = require("express-basic-auth");
const messageRouter = require("./routes/messageRouter");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());


if (process.env.CORS_ORIGINS) {
  const allow = process.env.CORS_ORIGINS.split(",").map(s => s.trim());
  app.use(cors({ origin: allow }));
} else {
  app.use(cors());
}

app.use(express.json());

app.use("/api/orders", ordersRoutes);
app.use("/api/messages", messageRouter);

const adminDir = path.resolve(__dirname, "..", "admin");
app.use(
  "/admin",
  basicAuth({
    users: { [process.env.ADMIN_USER || "admin"]: process.env.ADMIN_PASS || "secret" },
    challenge: true,
    realm: "admin",
  }),
  express.static(adminDir, { extensions: ["html"] })
);

const clientDir = path.resolve(__dirname, "..", "client");
app.use(express.static(clientDir, { extensions: ["html"] }));
app.get("/", (_req, res) => res.sendFile(path.join(clientDir, "index.html")));

app.get("/healthz", (_req, res) => res.status(200).send("ok"));

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
    const port = process.env.PORT || 8000;
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

main();

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit();
});
