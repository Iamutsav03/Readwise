// src/components/hooks/useSearchHighlight.js
//
// Returns a memoized customTextRenderer for react-pdf's <Page />.
// highlightText returns an HTML *string* (not JSX) because react-pdf
// uses dangerouslySetInnerHTML for the text layer.

import { useCallback } from "react";
import { highlightText } from "../../utils/highlightText";

/**
 * @param {string} searchQuery - Active search term from usePdfSearch
 * @returns {function} customTextRenderer — ({ str }) => htmlString
 */
export function useSearchHighlight(searchQuery) {
  const customTextRenderer = useCallback(
    ({ str }) => highlightText(str, searchQuery),
    [searchQuery]
  );

  return customTextRenderer;
}
