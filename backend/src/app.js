const express = require("express");
const cors = require("cors");
require("dotenv").config();

const apiRoutes = require("./routes/api.routes");
const sequelize = require("./config/db");
require("./models"); // Ensure associations are loaded

const app = express();
const PORT = process.env.PORT || 3333;

// Enable CORS for Expo frontend accessibility
app.use(cors());

// Body parser
app.use(express.json());

// Routes
app.use("/api", apiRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "SHIFT Premium API is running smoothly." });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({ error: "Algo deu errado no servidor!" });
});

// Sync Database and Start Server
sequelize
  .sync()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`============================================`);
      console.log(`🚗 SHIFT Premium Node.js API Started!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🌐 Accessible on local network at http://0.0.0.0:${PORT}`);
      console.log(`============================================`);
    });
  })
  .catch((err) => {
    console.error("Failed to sync database:", err);
  });

module.exports = app;
