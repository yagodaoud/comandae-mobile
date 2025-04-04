import React from 'react';
import { SearchBar } from './SearchBar';

interface HeaderSectionProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAddItem: () => void;
    onScanMenu: () => void;
    isSearching: boolean;
}

const HeaderSection = ({
    searchQuery,
    onSearchChange,
    onAddItem,
    onScanMenu,
}: HeaderSectionProps) => {
    return (
        <SearchBar
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
            onAddItem={onAddItem}
            onScanMenu={onScanMenu}
        />
    );
};

export default HeaderSection;
