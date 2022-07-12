import { useId } from "react";
export function LastSearches({
  lastSearches,
  onLastSearch,
}: {
  lastSearches: Array<string>;
  onLastSearch: (searchTerm: string) => void;
}) {
  const keyId = useId();
  return (
    <>
      {lastSearches.map((searchTerm) => (
        <button
          key={keyId + searchTerm}
          type="button"
          onClick={() => onLastSearch(searchTerm)}
        >
          {searchTerm}
        </button>
      ))}
    </>
  );
}
