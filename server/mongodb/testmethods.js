const connectDB = require("./mongo"); // Importer la connexion MongoDB

// Fonction de test pour getBestDiscountDeals
const testGetBestDiscountDeals = async () => {
    try {
        const db = await connectDB();
        const deals = await db.collection("deals").find().sort({ discount: -1 }).limit(10).toArray();
        
        console.log("🛒 Meilleures offres trouvées :", deals); // Afficher les résultats dans la console

        process.exit(); // Fermer le script après exécution
    } catch (error) {
        console.error("❌ Erreur:", error);
        process.exit(1);
    }
};

// Exécuter la fonction de test
testGetBestDiscountDeals();
