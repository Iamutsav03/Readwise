// hooks/useFavorites.js
// Derives a favorites list (max 5) from the full pdfs array.
// Returns { favorites, hasFavorites }

import { useMemo } from "react";

const MAX_FAVORITES = 5;

const useFavorites = (pdfs = []) => {
  const allFavorites = useMemo(
    () => pdfs.filter((p) => p.isFavorite),
    [pdfs]
  );

  return {
    favorites: allFavorites.slice(0, MAX_FAVORITES),
    hasFavorites: allFavorites.length > 0,
    totalFavorites: allFavorites.length,
  };
};

export default useFavorites;
