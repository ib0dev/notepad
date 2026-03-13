import React from 'react';
import { useNotes } from '../../hooks/useNotes';

export function SearchBar() {
  const { searchQuery, setSearch } = useNotes();

  return (
    <div className="px-5 pb-3 pt-1">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search notes..."
        className="w-full bg-transparent text-xs font-mono text-ink placeholder-shadow
                   border-b border-mist focus:border-fog outline-none py-1.5
                   transition-colors duration-200 tracking-wide dark:text-fog dark:border-stone dark:focus:border-ash dark:placeholder-smoke"
      />
    </div>
  );
}
