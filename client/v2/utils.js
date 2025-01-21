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
