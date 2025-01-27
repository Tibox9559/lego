// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
"use strict";

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};
let favoriteDeals = [];
//

// instantiate the selectors
const selectShow = document.querySelector("#show-select");
const selectPage = document.querySelector("#page-select");
const selectLegoSetIds = document.querySelector("#lego-set-id-select");
const sectionDeals = document.querySelector("#deals");
const spanNbDeals = document.querySelector("#nbDeals");
const selectSort = document.querySelector("#sort-select");
const discountFilterCheckbox = document.querySelector("#discount-filter");
const commentedFilterCheckbox = document.querySelector("#commented-filter");
const temperatureFilterCheckbox = document.querySelector("#temperature-filter");
const sectionFavorites = document.querySelector("#favorite-deals");
const sectionSales = document.querySelector("#sales");
const dealprice=document.querySelector("#dealprice");
/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({ result, meta }) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = (deals) => {
  sectionDeals.innerHTML = deals
    .map(
      (deal, index) => `
      <div class="card" data-index="${index}">
        <img src="${deal.photo}" alt="Lego Set Image"/>
        <div class="card-content">
          <h3>${deal.title}</h3>
          <p>Temperature : ${
            deal.temperature || "No temperature available."
          }</p>
          <p>Comments : ${deal.comments || "No comments available."}</p>
          <p><strong>${deal.price} €</strong></p>
          <button onclick="window.open('${
            deal.link
          }', '_blank')">View Deal</button>
          <button class="favorite-btn" onclick="addToFavorites(${index})">★ Add to Favorites</button>
        </div>
      </div>
    `
    )
    .join("");
};

const renderFavorites = () => {
  if (favoriteDeals.length === 0) {
    sectionFavorites.innerHTML = "<p>No favorite deals yet.</p>";
  } else {
    sectionFavorites.innerHTML = favoriteDeals
      .map(
        (deal) => `
        <div class="card">
          <img src=${deal.photo}" alt="Lego Set Image"/>
          <div class="card-content">
            <h3>${deal.title}</h3>
            <p>${deal.description || "No description available."}</p>
            <p><strong>${deal.price} €</strong></p>
            <button onclick="window.open('${
              deal.link
            }', '_blank')">View Deal</button>
            <button class="remove-btn" onclick="removeFromFavorites('${
              deal.id
            }')">Remove</button>
          </div>
        </div>
      `
      )
      .join("");
  }
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = (pagination) => {
  const { currentPage, pageCount } = pagination;
  const options = Array.from(
    { length: pageCount },
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join("");

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = (deals) => {
  const ids = getIdsFromDeals(deals);
  const options = ids
    .map((id) => `<option value="${id}">${id}</option>`)
    .join("");

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = (pagination) => {
  const { count } = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener("change", async (event) => {
  const deals = await fetchDeals(
    currentPagination.currentPage,
    parseInt(event.target.value)
  );

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Change page on "Go to page"
 */
selectPage.addEventListener("change", async (event) => {
  const selectedPage = parseInt(event.target.value);
  const deals = await fetchDeals(selectedPage, parseInt(selectShow.value));

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

// Listen for changes in the sort selector

selectSort.addEventListener("change", (event) => {
  const selectedSort = event.target.value; // Get selected value
  let filteredDeals = applyFilters([...currentDeals]); // Apply active filters first
  let sortedDeals;

  if (selectedSort === "price-asc") {
    sortedDeals = sortDealsByPrice(filteredDeals, "asc"); // Sort ascending by price
  } else if (selectedSort === "price-desc") {
    sortedDeals = sortDealsByPrice(filteredDeals, "desc"); // Sort descending by price
  } else if (selectedSort === "date-asc") {
    sortedDeals = sortDealsByDate(filteredDeals, "asc"); // Sort ascending by date
  } else if (selectedSort === "date-desc") {
    sortedDeals = sortDealsByDate(filteredDeals, "desc"); // Sort descending by date
  } else {
    sortedDeals = filteredDeals; // Default: no sorting
  }

  // Render sorted and filtered deals without changing pagination
  render(sortedDeals, currentPagination);
});

discountFilterCheckbox.addEventListener("change", () => {
  const filteredDeals = applyFilters([...currentDeals]);
  render(filteredDeals, currentPagination);
});

// Listen for changes in the commented filter checkbox
commentedFilterCheckbox.addEventListener("change", () => {
  const filteredDeals = applyFilters([...currentDeals]);
  render(filteredDeals, currentPagination);
});

temperatureFilterCheckbox.addEventListener("change", () => {
  const filteredDeals = applyFilters([...currentDeals]);
  render(filteredDeals, currentPagination);
});

/**
 * Initial load
 */
const renderPriceIndicators = (sales) => {
  const { average, p5, p25, p50 } = calculatePriceIndicators(sales);

  // Mettre à jour les valeurs dans le DOM
  document.querySelector("#average-price").textContent =
    average.toFixed(2) + " €";
  document.querySelector("#p5-price").textContent = p5.toFixed(2) + " €";
  document.querySelector("#p25-price").textContent = p25.toFixed(2) + " €";
  document.querySelector("#p50-price").textContent = p50.toFixed(2) + " €";
};
selectLegoSetIds.addEventListener("change", async (event) => {
  const selectedId = event.target.value; // Récupérer l'ID sélectionné
  const sales = await fetchSales(selectedId);
 
   // Récupérer les ventes pour cet ID
  if (sales) {
    renderSales(sales); // Afficher les ventes
    renderPriceIndicators(sales); // Mettre à jour les indicateurs de prix
  } else {
    sectionSales.innerHTML = "<p>No sales data available</p>"; // Afficher un message si aucune donnée
  }
});

const renderSales = (sales) => {
  // Générer le contenu HTML pour chaque vente
  sectionSales.innerHTML = sales
    .map((sale) => {
      // Calculer la différence en jours entre aujourd'hui et la date de publication
      const publishedDate = new Date(sale.published);
      const currentDate = new Date();
      const differenceInTime = currentDate - publishedDate;
      const differenceInDays = Math.floor(
        differenceInTime / (1000 * 60 * 60 * 24)
      );

      return `
        <div class="card">
          <img src="${sale.image || "Vinted_logo.png"}" alt="Lego Set Image"/>
          <div class="card-content">
            <h3>${sale.title}</h3>
            <p>Published ${differenceInDays} days ago</p>
            <p><strong>${sale.price} €</strong></p>
            <button onclick="window.open('${
              sale.link
            }', '_blank')">View Sale</button>
          </div>
        </div>
      `;
    })
    .join("");
};

document.addEventListener("DOMContentLoaded", async () => {
  favoriteDeals = loadFavoritesFromLocalStorage(); // Charger les favoris
  renderFavorites(); // Afficher les favoris

  // Fetch et afficher les deals
  const deals = await fetchDeals();
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);

  // Initialiser le sélecteur d'IDs Lego
  if (selectLegoSetIds.options.length > 0) {
    const firstId = selectLegoSetIds.options[0].value; // Obtenir le premier ID
    selectLegoSetIds.value = firstId; // Sélectionner le premier ID par défaut

    // Afficher le prix correspondant au premier ID
    const matchingDeal = currentDeals.find((deal) => deal.id === firstId);
    if (matchingDeal) {
      dealprice.textContent = `${matchingDeal.price} €`;
    } else {
      dealprice.textContent = "No deal found for the default ID";
    }

    // Initialiser les ventes et les indicateurs de prix pour le premier ID
    const sales = await fetchSales(firstId);
    if (sales) {
      renderSales(sales);
      renderPriceIndicators(sales);
    } else {
      sectionSales.innerHTML = "<p>No sales data available</p>";
    }
  }
});

selectLegoSetIds.addEventListener("change", async (event) => {
  const selectedId = event.target.value; // Récupérer l'ID sélectionné

  // Trouver le deal correspondant dans la liste des deals actuels
  const matchingDeal = currentDeals.find((deal) => deal.id === selectedId);

  if (matchingDeal) {
    // Afficher le prix dans l'élément HTML avec l'ID #dealprice
    dealprice.textContent = `${matchingDeal.price} €`;
  } else {
    // Si aucun deal ne correspond, afficher un message d'erreur
    dealprice.textContent = "Deal not found";
  }
});