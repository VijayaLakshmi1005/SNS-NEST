import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, Loader2, User, Briefcase, Ticket, X, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://sns-nest-backend.onrender.com/api';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        try {
          const res = await axios.get(`${API_URL}/search?q=${query}`, { withCredentials: true });
          setResults(res.data.data);
          setIsOpen(true);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const getIcon = (type) => {
    if (type === 'Module') return <Layout className="w-4 h-4 text-orange-500" />;
    if (type === 'User') return <User className="w-4 h-4 text-blue-500" />;
    if (type === 'Project') return <Briefcase className="w-4 h-4 text-emerald-500" />;
    if (type === 'Ticket') return <Ticket className="w-4 h-4 text-purple-500" />;
    return <Search className="w-4 h-4" />;
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm hidden sm:block z-50">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8175]" />
        <input 
          type="text"
          className="w-full pl-9 pr-8 py-2 bg-[#f5f5f0] border border-transparent focus:border-[#e5e0d8] focus:bg-white focus:outline-none rounded-lg text-sm text-[#2d2a26] transition-all"
          placeholder="Search projects, clients, tickets..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true) }}
        />
        {isLoading && <Loader2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8175] animate-spin" />}
        {query && !isLoading && (
          <button onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b8175] hover:text-black">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full max-w-lg bg-white border border-[#e5e0d8] rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-top-2 z-50">
          <div className="max-h-[400px] overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-4 text-sm text-[#8b8175] text-center">No results found for "{query}"</div>
            ) : (
              results.map((item, idx) => (
                <div 
                  key={`${item.id}-${idx}`}
                  onClick={() => {
                    navigate(item.link);
                    setIsOpen(false);
                    setQuery('');
                  }}
                  className="p-3 border-b border-[#e5e0d8] last:border-0 hover:bg-[#f5f5f0] cursor-pointer transition-colors flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-[#fcfbf9] border border-[#e5e0d8] flex items-center justify-center shrink-0">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#2d2a26] truncate">{item.title}</p>
                    <p className="text-xs text-[#8b8175] truncate">{item.subtitle}</p>
                  </div>
                  {item.meta && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[#e5e0d8] text-[#8b8175]">
                      {item.meta}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
