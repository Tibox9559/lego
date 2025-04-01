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
  getAllUniqueDealIds,
  getDealsSortedByTemperature,
  getAllDealsById,
  getAllDeals,
  getAllSales
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

app.get("/api/set-id", getAllUniqueDealIds);
app.get("/api/deals-by-best-discounts/:id", getBestDiscountDeals);
app.get("/api/deals-by-most-commented/:id", getMostCommentedDeals);
app.get("/api/deals-by-temperature/:id", getDealsSortedByTemperature);
app.get("/api/deals-by-price/:id", getDealsSortedByPrice);
app.get("/api/deals-by-date/:id", getDealsSortedByDate);
app.get("/api/deals/:id", getAllDealsById);
app.get("/api/deals", getAllDeals);
app.get("/api/sales", getAllSales);
app.get("/api/sales/:legoSetId", getSalesForLegoSet);




// ✅ Exporter l'application pour Vercel
module.exports = app;
