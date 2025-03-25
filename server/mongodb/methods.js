const connectDB = require("./mongo"); // Importer la connexion MongoDB

// 1️⃣ Trouver les meilleures réductions
const getBestDiscountDeals = async (req, res) => {
    try {
        const db = await connectDB();
        const deals = await db.collection("deals").find().sort({ discount: -1 }).toArray();
        
        

        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 2️⃣ Trouver les deals les plus commentés
const getMostCommentedDeals = async (req, res) => {
    try {
        const db = await connectDB();
        const deals = await db.collection("deals").find().sort({ commentCount: -1 }).toArray();
        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 3️⃣ Trier les deals par prix (ascendant)
const getDealsSortedByPrice = async (req, res) => {
    try {
        const db = await connectDB();
        const deals = await db.collection("deals").find().sort({ price: 1 }).toArray();
        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 4️⃣ Trier les deals par date (du plus récent au plus ancien)
const getDealsSortedByDate = async (req, res) => {
    try {
        const db = await connectDB();
        const deals = await db.collection("deals").find().toArray();

        // Convertir publishedAt en objet Date et trier par ordre décroissant
        deals.sort((a, b) => new Date(b.publishedAt * 1000) - new Date(a.publishedAt * 1000));

        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 5️⃣ Trouver les ventes pour un set LEGO donné
const getSalesForLegoSet = async (req, res) => {
    try {
        const legoSetId = req.params.legoSetId; // Récupérer l'ID du set depuis l'URL
        const db = await connectDB();
        const sales = await db.collection("sales").find({ id_lego: legoSetId }).toArray();
        res.json(sales);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};




// Export des fonctions pour les utiliser dans les routes
module.exports = {
    getBestDiscountDeals,
    getMostCommentedDeals,
    getDealsSortedByPrice,
    getDealsSortedByDate,
    getSalesForLegoSet,
    
};
