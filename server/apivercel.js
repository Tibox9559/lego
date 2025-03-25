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
} = require("./mongodb/methods");

const connectDB = require("./mongodb/mongo");

const app = express();

app.use(require("body-parser").json());
app.use(cors());
app.use(helmet());
app.options("*", cors());

// Connexion à MongoDB au démarrage
connectDB().then(() => console.log("✅ Connecté à MongoDB"));

// ✅ Définition des routes
app.get("/", (req, res) => {
  res.send({ ack: true });
});

app.get("/api/best-discounts", getBestDiscountDeals);
app.get("/api/most-commented", getMostCommentedDeals);
app.get("/api/deals-by-price", getDealsSortedByPrice);
app.get("/api/deals-by-date", getDealsSortedByDate);
app.get("/api/sales/:legoSetId", getSalesForLegoSet);

// ✅ Exporter l'application pour Vercel
module.exports = app;
