import React, { useState, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, History, Sparkles } from 'lucide-react';
import { searchService } from '../../services/search.service';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../routes/routeConfig';

interface SearchBarProps {
    onSearch?: (query: string) => void;
    placeholder?: string;
    className?: string;
    showDropdown?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSearch,
    placeholder = 'Search products...',
    className = '',
    showDropdown = true
}) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [trending, setTrending] = useState<string[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const data = await searchService.getTrending();
                setTrending(data);
            } catch (error) {
                console.error('Failed to fetch trending searches', error);
            }
        };
        fetchTrending();
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.trim().length < 2) {
                setSuggestions([]);
                return;
            }
            setLoading(true);
            try {
                const data = await searchService.getSuggestions(query);
                setSuggestions(data);
            } catch (error) {
                console.error('Failed to fetch suggestions', error);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSubmit = (e?: React.FormEvent, selectedQuery?: string) => {
        e?.preventDefault();
        const finalQuery = selectedQuery || query;

        setIsFocused(false);

        if (finalQuery.trim()) {
            if (onSearch) {
                onSearch(finalQuery);
            } else {
                navigate(`${ROUTES.PRODUCTS.ROOT}?search=${encodeURIComponent(finalQuery)}`);
            }
        } else {
            // Check if we are already handling clear
            if (onSearch) {
                onSearch('');
            } else {
                navigate(ROUTES.PRODUCTS.ROOT);
            }
        }
    };

    const handleClear = () => {
        setQuery('');
        if (onSearch) {
            onSearch('');
        } else {
            // Navigate to products page without search parameter
            navigate(ROUTES.PRODUCTS.ROOT);
        }
    };

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            <form onSubmit={(e) => handleSubmit(e)} className="relative z-50">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-11 py-2.5 bg-primary/5 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl text-sm font-bold placeholder-secondary/50 transition-all outline-none uppercase tracking-wide text-primary"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-primary p-1"
                    >
                        <X size={16} />
                    </button>
                )}
            </form>

            {/* Dropdown Suggestions */}
            {showDropdown && isFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-primary/10 shadow-2xl rounded-3xl overflow-hidden z-40 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                        {/* Suggestions from typing */}
                        {query.trim().length >= 2 && (
                            <div className="space-y-1">
                                {loading && suggestions.length === 0 ? (
                                    <div className="px-4 py-3 text-xs text-secondary animate-pulse">Searching...</div>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setQuery(s);
                                                handleSubmit(undefined, s);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 text-sm text-primary transition-colors text-left font-bold"
                                        >
                                            <Sparkles size={14} className="text-primary" />
                                            <span className="uppercase tracking-wide">{s}</span>
                                        </button>
                                    ))
                                ) : !loading && (
                                            <div className="px-4 py-3 text-xs text-secondary uppercase tracking-widest font-black">No results for "{query}"</div>
                                )}
                            </div>
                        )}

                        {/* Trending / Default View */}
                        {query.trim().length < 2 && (
                            <div className="space-y-4 p-2">
                                {trending.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="px-2 text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                            <TrendingUp size={12} />
                                            Trending Searches
                                        </h4>
                                        <div className="flex flex-wrap gap-2 px-2">
                                            {trending.map((t, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        setQuery(t);
                                                        handleSubmit(undefined, t);
                                                    }}
                                                    className="px-4 py-2 bg-primary/5 hover:bg-primary/10 hover:text-primary rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-transparent hover:border-primary/10"
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h4 className="px-2 text-[10px] font-black text-secondary uppercase tracking-[0.2em] flex items-center gap-2">
                                        <History size={12} />
                                        Quick Categories
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 px-2">
                                        {['New Arrivals', 'Premium Picks', 'On Sale'].map((cat, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    setQuery(cat);
                                                    handleSubmit(undefined, cat);
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-primary/5 rounded-2xl text-xs font-bold uppercase tracking-widest text-primary/70 transition-colors"
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
