// Fonction pour récupérer les Set ID via l'API
async function loadSetIds() {
  try {
    const response = await fetch("https://lego-lemon.vercel.app/api/set-id");

    if (!response.ok) {
      throw new Error("Problème avec la récupération des données");
    }

    const data = await response.json();
    const setIdSelect = document.getElementById("setId");

    data.forEach((id) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = id;
      setIdSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour récupérer tous les deals d'un Set ID et mettre à jour l'UI
async function loadAllDealsBySetId(setId) {
  try {
    // Étape 1 : Récupérer tous les deals pour ce Set ID
    const response = await fetch(
      `https://lego-lemon.vercel.app/api/deals/${setId}`
    );
    if (!response.ok) {
      throw new Error("Problème lors de la récupération des deals");
    }

    const deals = await response.json();
    const totalDealsCount = deals.length; // Nombre total de deals

    // Afficher les deals en liste complète
    displayDeals(deals);

    // Activer la sélection du nombre de deals par page après affichage
    document.getElementById("show").disabled = false;

    // Sauvegarder le total des deals pour le Set ID sélectionné
    document.getElementById("show").dataset.totalDeals = totalDealsCount;
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour afficher une liste de deals
function displayDeals(deals) {
  const dealsContainer = document.querySelector(".deals-container");
  dealsContainer.innerHTML = "<h2>Deals</h2>";

  if (deals.length > 0) {
    deals.forEach((deal) => {
      const date = new Date(deal.publishedAt * 1000);
      const formattedDate = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });

      const card = document.createElement("div");
      card.classList.add("deal-card");
      card.innerHTML = `
                <h3 class="deal-title">${deal.titleSlug}</h3>
                <img src="${deal.image}" alt="Lego Set Image"/>
                <p><strong>Comments:</strong> ${deal.commentCount}</p>
                <p><strong>Temperature:</strong> ${deal.temperature}</p>
                <p><strong>Price:</strong> ${deal.price} € <span class="discount">(-${deal.discount}%)</span></p>
                <a href="${deal.link}" target="_blank" class="btn-details">Details</a>
                <p class="publish-date">Published on: ${formattedDate}</p>
            `;
      dealsContainer.appendChild(card);
    });
  } else {
    dealsContainer.innerHTML += "<p>Aucun deal trouvé pour ce Set ID.</p>";
  }
}

// Fonction pour mettre à jour dynamiquement les pages disponibles
function updatePageOptions(totalPages) {
  const goToPageSelect = document.getElementById("goToPage");
  goToPageSelect.innerHTML = "<option>Go to Page</option>";

  for (let i = 1; i <= totalPages; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = `Page ${i}`;
    goToPageSelect.appendChild(option);
  }

  // Activer la sélection des pages
  goToPageSelect.disabled = false;
}

// Fonction pour récupérer les deals avec pagination
async function loadPaginatedDeals(setId, limit, page) {
  try {
    const response = await fetch(
      `https://lego-lemon.vercel.app/api/deals/${setId}?limit=${limit}&page=${page}`
    );
    if (!response.ok) {
      throw new Error("Problème avec la récupération des deals");
    }

    const deals = await response.json();
    displayDeals(deals);
  } catch (error) {
    console.error("Erreur:", error);
  }
}

// Fonction pour gérer le changement de Set ID
async function handleSetIdChange() {
  const setId = document.getElementById("setId").value;
  if (setId !== "Set ID") {
    await loadAllDealsBySetId(setId);
    await loadSalesBySetId(setId); // Charger les ventes également
  }
}

// Fonction pour gérer la sélection du nombre de deals par page
function handleShowChange() {
  const setId = document.getElementById("setId").value;
  const limit = parseInt(document.getElementById("show").value);
  const totalDeals = parseInt(
    document.getElementById("show").dataset.totalDeals
  );
  const filter = document.getElementById("filter").value;

  if (setId !== "Set ID" && limit > 0) {
    const totalPages = Math.ceil(totalDeals / limit);
    updatePageOptions(totalPages);

    // Sélectionner la page 1 par défaut et charger les deals avec filtre si existant
    document.getElementById("goToPage").value = 1;
    loadFilteredDeals(setId, limit, 1, filter);
  }
}

// Fonction pour gérer le changement de page
async function handlePageChange() {
  const setId = document.getElementById("setId").value;
  const limit = parseInt(document.getElementById("show").value) || null;
  const page = parseInt(document.getElementById("goToPage").value);
  const filter = document.getElementById("filter").value;

  if (setId !== "Set ID" && page > 0) {
    await loadFilteredDeals(setId, limit, page, filter);
  }
}

// Fonction pour gérer le changement de filtre
async function handleFilterChange() {
  const setId = document.getElementById("setId").value;
  const limit = parseInt(document.getElementById("show").value) || null;
  const filter = document.getElementById("filter").value;

  if (setId !== "Set ID") {
    document.getElementById("goToPage").value = 1;
    await loadFilteredDeals(setId, limit, 1, filter);
  }
}

// Fonction pour récupérer les deals filtrés avec ou sans pagination
async function loadFilteredDeals(setId, limit, page, filter) {
  let endpoint;
  switch (filter) {
    case "best-discounts":
      endpoint = `deals-by-best-discounts`;
      break;
    case "most-commented":
      endpoint = `deals-by-most-commented`;
      break;
    case "temperature":
      endpoint = `deals-by-temperature`;
      break;
    case "price":
      endpoint = `deals-by-price`;
      break;
    case "date":
      endpoint = `deals-by-date`;
      break;
    default:
      endpoint = `deals`;
  }

  try {
    let url = `https://lego-lemon.vercel.app/api/${endpoint}/${setId}`;
    if (limit) {
      url += `?limit=${limit}&page=${page}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Problème avec la récupération des deals filtrés");
    }
    const deals = await response.json();
    displayDeals(deals);
  } catch (error) {
    console.error("Erreur:", error);
  }
}
const calculatePriceIndicators = (sales) => {
  if (!sales || sales.length === 0) {
    return { average: 0, p5: 0, p25: 0, p50: 0 };
  }

  const prices = sales
    .map((sale) => parseFloat(sale.total_item_price.amount)) // Accès au prix via total_item_price.amount
    .filter((price) => !isNaN(price))
    .sort((a, b) => a - b);

  if (prices.length === 0) {
    return { average: 0, p5: 0, p25: 0, p50: 0 };
  }

  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const p5 = prices[Math.floor((5 / 100) * prices.length)];
  const p25 = prices[Math.floor((25 / 100) * prices.length)];
  const p50 = prices[Math.floor((50 / 100) * prices.length)];

  return { average, p5, p25, p50 };
};

async function loadSalesBySetId(setId) {
  try {
    const response = await fetch(
      `https://lego-lemon.vercel.app/api/sales/${setId}`
    );

    if (!response.ok) {
      throw new Error("Problème lors de la récupération des ventes");
    }

    const salesData = await response.json();
    console.log(salesData);
    const salesCount = salesData.length;

    // Calculer les indicateurs de prix
    const indicators = calculatePriceIndicators(salesData);

    // Mettre à jour la section "Vinted Resell Market"
    document.querySelector(".info-container").innerHTML = `
            <h2>Vinted Resell Market</h2>
            <p><strong>Number of Sales:</strong> ${salesCount}</p>
            <div class="statistics">
                <p><strong>Average Price:</strong> ${indicators.average.toFixed(
                  2
                )}€</p>
                <p><strong>5th Percentile (P5):</strong> ${indicators.p5.toFixed(
                  2
                )}€</p>
                <p><strong>25th Percentile (P25):</strong> ${indicators.p25.toFixed(
                  2
                )}€</p>
                <div class="median-highlight">
                    <p><strong>50th Percentile (Median, P50)</strong> ${indicators.p50.toFixed(
                      2
                    )}€</p>
                </div>
            </div>
        `;

    // Mettre à jour la section "Sales"
    const salesContainer = document.querySelector(".sales-container");
    salesContainer.innerHTML = "<h2>Sales</h2>";

    salesData.forEach((sale) => {
      const saleCard = document.createElement("div");
      saleCard.classList.add("deal-card3");
      saleCard.innerHTML = `
                <h3 class="deal-title">${sale.title}</h3>
                <img src="${sale.photo}" alt="Lego Set Image"/>
                <p><strong>Price:</strong> ${sale.total_item_price.amount} € </p>
                <a href="${sale.url}" class="btn-details" target="_blank">View Sale</a>
            `;
      salesContainer.appendChild(saleCard);
    });
  } catch (error) {
    console.error("Erreur:", error);
    document.querySelector(".info-container").innerHTML = `
            <h2>Vinted Resell Market</h2>
            <p class="error">A problem occurred with data, please try again later.</p>
        `;
  }
}

async function fetchAllDeals() {
  try {
    // Récupérer les deals et toutes les ventes en une seule requête
    const [dealsResponse, salesResponse] = await Promise.all([
      fetch("https://lego-lemon.vercel.app/api/deals"),
      fetch("https://lego-lemon.vercel.app/api/sales"),
    ]);

    if (!dealsResponse.ok || !salesResponse.ok) {
      throw new Error("Problème lors de la récupération des données");
    }

    const [deals, sales] = await Promise.all([
      dealsResponse.json(),
      salesResponse.json(),
    ]);

    // Créer un Map pour accéder rapidement aux ventes par Set ID
    const salesMap = new Map();
    sales.forEach((sale) => {
      const salesForSetId = salesMap.get(sale.setId) || [];
      salesForSetId.push(sale);
      salesMap.set(sale.setId, salesForSetId);
    });

    // Calculer les scores avec les données de ventes
    const scoredDeals = deals.map((deal) => ({
      ...deal,
      score: calculateScore(deal, salesMap.get(deal.setId)),
    }));

    // Trier les deals par score décroissant
    const bestDeals = scoredDeals.sort((a, b) => b.score - a.score);

    const bestDeals2 = [];

    // Pour chaque élément dans bestDeals
    for (const deal of bestDeals) {
      // Étape 1 : Vérifier si un élément avec le même threadId existe déjà dans bestDeals2
      const existingThreadIds = bestDeals2.map((d) => d.threadId);
      if (existingThreadIds.includes(deal.threadId)) {
        continue; // Passer à l'élément suivant si threadId existe déjà
      }

      // Étape 2 : Chercher dans bestDeals si un élément avec le même ID et un prix plus bas existe
      const lowerPricedDeal = bestDeals.find(
        (otherDeal) => otherDeal.id === deal.id && otherDeal.price < deal.price
      );

      // Ajout des éléments dans l'ordre correct
      if (lowerPricedDeal) {
        // Ajouter d'abord l'élément moins cher
        bestDeals2.push(lowerPricedDeal);
      }
      // Ajouter ensuite l'élément courant
      bestDeals2.push(deal);
    }

    console.log("bestDeals:", bestDeals);
    console.log("bestDeals2:", bestDeals2);

    displayBestDeals(bestDeals2.slice(0, 10));
  } catch (error) {
    console.error("Erreur:", error);
  }
}

function calculateScore(deal, salesData) {
  // Définition des poids pour chaque critère
  const weights = {
    discount: 0.4, // Importance accrue des réductions
    popularity: 0.05, // Impact social
    trend: 0.05, // Popularité temporaire
    age: 0.05, // Fraîcheur
    market: 0.45, // Positionnement sur le marché
  };

  // Score de remise normalisé (0-100)
  const maxDiscount = 90; // Remise maximale typique
  let discountScore = Math.min(deal.discount / maxDiscount, 1) * 100;

  // Score de popularité basé sur les commentaires
  const logBase = Math.log(Math.max(1, deal.commentCount + 1));
  const maxLogComment = Math.log(20); // Normalisation sur 100 commentaires max
  let popularityScore = (logBase / maxLogComment) * 100;

  // Score de tendance (température)
  let trendScore = (deal.temperature / 100) * 100;

  // Score d'âge (en jours)
  const daysAgo =
    (Date.now() - deal.publishedAt * 1000) / (1000 * 60 * 60 * 24);
  const halfLife = 10; // Demi-vie de 8 jours pour l'impact de l'âge
  let ageScore = Math.exp(-daysAgo / halfLife) * 100;

  // Score de marché basé sur les indicateurs de prix
  let marketScore;
  if (salesData && salesData.length > 0) {
    const indicators = calculatePriceIndicators(salesData);

    // Calcul du score de marché basé sur la position relative
    const price = deal.price;
    if (price <= indicators.p5) {
      marketScore = 100; // Meilleur score pour les prix très compétitifs
    } else if (price <= indicators.p25) {
      marketScore = 80; // Très bon score pour les prix dans le 1er quartile
    } else if (price <= indicators.p50) {
      marketScore = 60; // Bon score pour les prix dans le 2ème quartile
    } else if (price <= indicators.p25 * 2) {
      marketScore = 40; // Score moyen pour les prix au-dessus de la médiane
    } else {
      marketScore = 20; // Score faible pour les prix élevés
    }
  } else {
    marketScore = 50; // Valeur neutre si pas de données
  }

  // Calcul du score final pondéré
  return (
    discountScore * weights.discount +
    popularityScore * weights.popularity +
    trendScore * weights.trend +
    ageScore * weights.age +
    marketScore * weights.market
  );
}

function displayBestDeals(bestDeals) {
  const bestDealsContainer = document.getElementById("best-deals");
  bestDealsContainer.innerHTML = ""; // Vider le conteneur avant d'ajouter les nouveaux deals

  bestDeals.forEach((deal) => {
    const dealCard = document.createElement("div");
    dealCard.classList.add("deal-card2");
    dealCard.innerHTML = `
            <h3 class="deal-title">${deal.titleSlug}</h3>
            <img src="${deal.image}" alt="Lego Set Image"/>
            <p><strong>Comments:</strong> ${deal.commentCount}</p>
            <p><strong>Temperature:</strong> ${deal.temperature}</p>
            <p><strong>Price:</strong> ${deal.price} € <span class="discount">(-${deal.discount}%)</span></p>
            <a href="${deal.link}" target="_blank" class="btn-details">Details</a>
        `;
    bestDealsContainer.appendChild(dealCard);
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const findDealsButton = document.querySelector("button");
  const popupOverlay = document.getElementById("popup-overlay");
  const closePopupButton = document.getElementById("close-popup");

  // Affiche le popup quand on clique sur le bouton
  findDealsButton.addEventListener("click", function () {
    popupOverlay.classList.add("active");
  });

  // Ferme le popup quand on clique sur la croix
  closePopupButton.addEventListener("click", function () {
    popupOverlay.classList.remove("active");
  });

  // Ferme le popup si on clique en dehors du contenu
  popupOverlay.addEventListener("click", function (event) {
    if (event.target === popupOverlay) {
      popupOverlay.classList.remove("active");
    }
  });
});

document.addEventListener("DOMContentLoaded", fetchAllDeals);

// Ajouter les écouteurs d'événements pour mettre à jour les deals en fonction des sélections
document.getElementById("setId").addEventListener("change", handleSetIdChange);
document.getElementById("show").addEventListener("change", handleShowChange);
document
  .getElementById("goToPage")
  .addEventListener("change", handlePageChange);

// Désactiver les options jusqu'à la sélection d'un Set ID
document.getElementById("show").disabled = true;
document.getElementById("goToPage").disabled = true;

// Charger les Set ID au démarrage
document.addEventListener("DOMContentLoaded", loadSetIds);
