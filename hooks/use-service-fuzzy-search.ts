import { useMemo, useState } from 'react';

import { fuzzySearchServices, type SearchableService } from '../features/services/service-search';

export function useServiceFuzzySearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);

  const results = useMemo(() => fuzzySearchServices(query), [query]);

  return {
    query,
    setQuery,
    results,
    hasQuery: query.trim().length > 0,
    resultCount: results.length,
  };
}

export type { SearchableService };
