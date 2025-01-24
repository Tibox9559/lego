// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
"use strict";

/**
 *
 * @param {Array} deals - list of deals
 * @returns {Array} list of lego set ids
 */
const getIdsFromDeals = (deals) => {
  return deals.map((deal) => deal.id);
};
/**
 * Sort deals by price in ascending or descending order
 * @param  {Array} deals - list of deals
 * @param  {String} order - sorting order ("asc" or "desc")
 * @return {Array} - sorted list of deals
 */
const sortDealsByPrice = (deals, order = "asc") => {
  return deals.sort((a, b) => {
    return order === "asc" ? a.price - b.price : b.price - a.price;
  });
};

/**
 * Filter deals with 50% or more discount
 * @param {Array} deals - list of deals
 * @return {Array} - filtered deals
 */
const filterDealsByDiscount = (deals) => {
  return deals.filter((deal) => deal.discount >= 50);
};
/**
 * Filter deals with 15 comments or more
 * @param {Array} deals - list of deals
 * @return {Array} - filtered deals
 */
const filterDealsByComments = (deals) => {
  return deals.filter((deal) => deal.comments >= 8);
};
const filterDealsByTemperature = (deals) => {
  return deals.filter((deal) => deal.temperature >= 100.0);
};
/**
 * Sort deals by date in ascending or descending order
 * @param  {Array} deals - list of deals
 * @param  {String} order - sorting order ("asc" or "desc")
 * @return {Array} - sorted list of deals
 */
const sortDealsByDate = (deals, order = "asc") => {
  return deals.sort((a, b) => {
    const dateA = new Date(a.published);
    const dateB = new Date(b.published);
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
};
/**
 * Apply all active filters to the deals
 * @param {Array} deals - list of deals
 * @return {Array} - filtered deals
 */
const applyFilters = (deals) => {
  let filteredDeals = [...deals];

  // Apply discount filter if checked
  if (discountFilterCheckbox.checked) {
    filteredDeals = filterDealsByDiscount(filteredDeals);
  }

  // Apply commented filter if checked
  if (commentedFilterCheckbox.checked) {
    filteredDeals = filterDealsByComments(filteredDeals);
  }
  if (temperatureFilterCheckbox.checked) {
    filteredDeals = filterDealsByTemperature(filteredDeals);
  }

  return filteredDeals;
};
/**
 * Calculate average, p5, p25, and p50 price indicators
 * @param {Array} sales - List of sales, each with a `price` property
 * @returns {Object} - Object with `average`, `p5`, `p25`, and `p50` indicators
 */
const calculatePriceIndicators = (sales) => {
  if (!sales || sales.length === 0) {
    return { average: 0, p5: 0, p25: 0, p50: 0 };
  }

  const prices = sales
    .map((sale) => parseFloat(sale.price)) // S'assurer que les prix sont des nombres
    .filter((price) => !isNaN(price)) // Supprimer les valeurs non numériques
    .sort((a, b) => a - b); // Trier les prix en ordre croissant

  if (prices.length === 0) {
    return { average: 0, p5: 0, p25: 0, p50: 0 };
  }

  const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const p5 = prices[Math.floor((5 / 100) * prices.length)];
  const p25 = prices[Math.floor((25 / 100) * prices.length)];
  const p50 = prices[Math.floor((50 / 100) * prices.length)];

  return { average, p5, p25, p50 };
};

