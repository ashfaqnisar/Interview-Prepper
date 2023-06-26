import React, { useState } from "react";

const SearchBar = ({ updateQuery }: { updateQuery: (query: string) => void }) => {
  const [searchText, setSearchText] = useState("");

  return (
    <div>
      <h3>Search Bar</h3>
    </div>
  );
};

export default SearchBar;
