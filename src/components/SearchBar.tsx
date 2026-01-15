'use client';

import {useState, useEffect, useRef} from 'react';
import {Search} from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onSearchChange: (query: string) => void;
    onFocus: () => void;
    onEnter: () => void;
    value?: string;
}

export default function SearchBar({onSearchChange, onFocus, onEnter, value}: SearchBarProps) {
    const [searchQuery, setSearchQuery] = useState(value ?? '');
    const expandTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Sync with controlled value prop
    useEffect(() => {
        if (value !== undefined) {
            setSearchQuery(value);
        }
    }, [value]);


    useEffect(() => {
        return () => {
            if (expandTimeoutRef.current) {
                clearTimeout(expandTimeoutRef.current);
            }
        };
    }, []);

    const handleFocus = () => {
        expandTimeoutRef.current = setTimeout(() => {
            onFocus();
        }, 500);
    };

    const handleBlur = () => {
        if (expandTimeoutRef.current) {
            clearTimeout(expandTimeoutRef.current);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearchChange(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onEnter();
        }
    };

    return (
        <div className={styles.searchBar}>
            <div className={styles.inputWrapper}>
                <Search className={styles.searchIcon} size={20}/>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for carpentry supplies..."
                    className={styles.searchInput}
                />
            </div>
        </div>
    );
}
