require("dotenv").config();
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const {
  getBestDiscountDeals,
  getMostCommentedDeals,
  getDealsSortedByPrice,
  getDealsSortedByDate,
  getSalesForLegoSet,
  getRecentSales,
} = require("./mongodb/methods"); // Import des méthodes
const connectDB = require("./mongodb/mongo"); // Importer la connexion MongoDB
const PORT = 8092;
const app = express();

app.use(require("body-parser").json());
app.use(cors());
app.use(helmet());

app.options("*", cors());

// Route de test
app.get("/", (req, res) => {
  res.send({ ack: true });
});

// ✅ Routes pour les deals
app.get("/api/best-discounts", getBestDiscountDeals);
app.get("/api/most-commented", getMostCommentedDeals);
app.get("/api/deals-by-price", getDealsSortedByPrice);
app.get("/api/deals-by-date", getDealsSortedByDate);
app.get("/api/sales/:legoSetId", getSalesForLegoSet);
app.get("/api/recent-sales", getRecentSales);

// Lancer le serveur
app.listen(PORT, async () => {
  await connectDB();
  console.log(`📡 Serveur en cours d'exécution sur le port ${PORT}`);
});

module.exports = app;
