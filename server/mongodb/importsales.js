require("dotenv").config({ path: __dirname + "/../.env" });
const { MongoClient } = require("mongodb");
const fs = require("fs");

// Charger les variables d'environnement
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

// Fonction principale
async function insertDeals() {
  try {
    // Connexion à MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection("sales");

    // Lire le fichier JSON
    // Lire le fichier JSON
    // Lire le fichier JSON
    const rawDeals = JSON.parse(fs.readFileSync("sales.json", "utf8"));

    // Transformer l'objet en tableau de deals
    const deals = Object.values(rawDeals).flat();

    // Insérer les données dans MongoDB
    const result = await collection.insertMany(deals);

    console.log(`✅ ${result.insertedCount} sales insérés avec succès !`);
    client.close();
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion des deals :", error);
  }
}

// Exécuter la fonction
insertDeals();
