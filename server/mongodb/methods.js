const connectDB = require("./mongo"); // Importer la connexion MongoDB

// Fonction pour extraire la pagination depuis la requête
const getPagination = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    return { limit, skip };
};

// 1️⃣ Trouver les meilleures réductions pour un ID donné
const getBestDiscountDeals = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const dealId = req.params.id; // ID du deal en string
        const db = await connectDB();
        const deals = await db.collection("deals").find({ id: dealId }) // 🔹 Filtrer sur `id` au lieu de `_id`
            .sort({ discount: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 2️⃣ Trouver les deals les plus commentés pour un ID donné
const getMostCommentedDeals = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const dealId = req.params.id;
        const db = await connectDB();
        const deals = await db.collection("deals").find({ id: dealId })
            .sort({ commentCount: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 3️⃣ Trier les deals par prix (ascendant) pour un ID donné
const getDealsSortedByPrice = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const dealId = req.params.id;
        const db = await connectDB();
        const deals = await db.collection("deals").find({ id: dealId })
            .sort({ price: 1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 4️⃣ Trier les deals par date (du plus récent au plus ancien) pour un ID donné
const getDealsSortedByDate = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const dealId = req.params.id;
        const db = await connectDB();
        const deals = await db.collection("deals").find({ id: dealId })
            .skip(skip)
            .limit(limit)
            .toArray();
        
        // Convertir `publishedAt` en objet Date et trier par ordre décroissant
        deals.sort((a, b) => new Date(b.publishedAt * 1000) - new Date(a.publishedAt * 1000));

        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 5️⃣ Trier les deals par température (du plus chaud au plus froid) pour un ID donné
const getDealsSortedByTemperature = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const dealId = req.params.id;
        const db = await connectDB();
        const deals = await db.collection("deals").find({ id: dealId })
            .sort({ temperature: -1 })
            .skip(skip)
            .limit(limit)
            .toArray();
        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 6️⃣ Trouver les ventes pour un set LEGO donné
const getSalesForLegoSet = async (req, res) => {
    try {
        const legoSetId = req.params.legoSetId; // Récupérer l'ID du set depuis l'URL
        const { limit, skip } = getPagination(req);
        const db = await connectDB();
        const sales = await db.collection("sales").find({ id_lego: legoSetId })
            .skip(skip)
            .limit(limit)
            .toArray();
        res.json(sales);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 7️⃣ Récupérer tous les IDs uniques des deals
const getAllUniqueDealIds = async (req, res) => {
    try {
        const db = await connectDB();
        const dealIds = await db.collection("deals").distinct("id"); // 🔹 Récupérer les IDs uniques
        res.json(dealIds);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// 8️⃣ Trouver tous les deals pour un ID donné avec pagination
const getAllDealsById = async (req, res) => {
    try {
        const { limit, skip } = getPagination(req);
        const dealId = req.params.id; // ID du deal en string
        const db = await connectDB();
        const deals = await db.collection("deals").find({ id: dealId }) // Filtrer par `id`
            .skip(skip)
            .limit(limit)
            .toArray();
        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
const getAllDeals = async (req, res) => {
    try {
        const db = await connectDB();
        const deals = await db.collection("deals").find().toArray();
        res.json(deals);
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
const getAllSales = async (req, res) => {
    try {
        const db = await connectDB();
        const sales = await db.collection("sales").find().toArray();
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
    getDealsSortedByTemperature,
    getSalesForLegoSet,
    getAllUniqueDealIds,
    getAllDealsById,
    getAllDeals,
    getAllSales
};
