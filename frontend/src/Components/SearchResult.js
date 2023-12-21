
import React from 'react';

const SearchResult = ({ result, onSelect }) => {
  return (
    <div>
      <h2>{result.title}</h2>
      <p>{result.snippet}</p>
      <button onClick={() => onSelect(result.title)}>Read More</button>
    </div>
  );
};

export default SearchResult;
