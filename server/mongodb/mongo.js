require('dotenv').config(); // Charger les variables d'environnement
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

async function connectDB() {
    try {
        const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connexion réussie à MongoDB');
        return client.db(MONGODB_DB_NAME);
    } catch (error) {
        console.error('❌ Erreur de connexion à MongoDB', error);
        process.exit(1);
    }
}

module.exports = connectDB