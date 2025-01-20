// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';


/**
 * 
 * @param {Array} deals - list of deals
 * @returns {Array} list of lego set ids
 */
const getIdsFromDeals = deals => {
    return deals.map(deal => deal.id)

}

function sortDealsByPrice(deals) {
    return deals.sort((a, b) => a.price - b.price);
  }
  // 2. Create a variable and assign it the list of sets by price from lowest to highest
  const sortedDeals = sortDealsByPrice([...deals])
