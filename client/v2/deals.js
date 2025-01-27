/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return { currentDeals, currentPagination };
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return { currentDeals, currentPagination };
  }
};

const saveFavoritesToLocalStorage = () => {
  localStorage.setItem("favoriteDeals", JSON.stringify(favoriteDeals));
};

const loadFavoritesFromLocalStorage = () => {
  const storedFavorites = localStorage.getItem("favoriteDeals");
  return storedFavorites ? JSON.parse(storedFavorites) : [];
};

const addToFavorites = (index) => {
  const deal = currentDeals[index];

  if (!favoriteDeals.some((fav) => fav.id === deal.id)) {
    favoriteDeals.push(deal);
    saveFavoritesToLocalStorage(); // Save updated favorites
    renderFavorites();
    console.log("Deal added to favorites:", deal);
  } else {
    console.log("Deal already in favorites:", deal);
  }
};

const removeFromFavorites = (id) => {
  favoriteDeals = favoriteDeals.filter((deal) => deal.id !== id);
  saveFavoritesToLocalStorage(); // Save updated favorites
  renderFavorites();
  console.log("Deal removed from favorites:", id);
};
