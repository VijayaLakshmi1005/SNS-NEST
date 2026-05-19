import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import api from '../utils/api.js';
import {
  Heart,
  FolderHeart,
  Grid,
  ListFilter,
  Search,
  Plus,
  Share2,
  Trash2,
  Edit3,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Columns,
  MessageSquare,
  Sparkles,
  ClipboardList,
  Check,
  X,
  FileText,
  Copy,
  ExternalLink,
  HelpCircle,
  Loader2
} from 'lucide-react';

const THEME = {
  light: {
    bg: 'bg-[#F5EBE0]',
    card: 'bg-[#E3D5CA]/50 border-[#D6CCC2]/40',
    cardInner: 'bg-[#F5EBE0]/80 border-[#D6CCC2]/20',
    text: 'text-[#2B2B2B]',
    textMuted: 'text-[#4A4340]',
    accent: 'bg-[#C9B7A7]/50 text-[#2B2B2B]',
    border: 'border-[#D6CCC2]/30',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    inputBg: 'bg-white border-[#D6CCC2]/60 text-[#2B2B2B]',
    accentText: 'text-amber-800'
  },
  dark: {
    bg: 'bg-[#1E1A17]',
    card: 'bg-[#2A241F]/60 border-[#3A312B]',
    cardInner: 'bg-[#1E1A17]/80 border-[#3A312B]',
    text: 'text-[#F5EBE0]',
    textMuted: 'text-[#E3D5CA]/70',
    accent: 'bg-[#3A312B] text-[#F5EBE0]',
    border: 'border-[#3A312B]',
    shadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]',
    inputBg: 'bg-[#1E1A17] border-[#3A312B] text-[#F5EBE0]',
    accentText: 'text-amber-400'
  }
};

const ROOMS = ['All Rooms', 'Kitchen', 'Bedroom', 'Living Room', 'Office', 'Bathroom'];
const STYLES = ['All Styles', 'Scandinavian', 'Minimal', 'Luxury', 'Contemporary'];

export default function Wishlist() {
  const { isNight } = useThemeStore();
  const theme = isNight ? THEME.dark : THEME.light;

  // State Management
  const [wishlistItems, setWishlistItems] = useState([]);
  const [collections, setCollections] = useState([]);
  const [sharedInspirations, setSharedInspirations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedRoom, setSelectedRoom] = useState('All Rooms');
  const [selectedStyle, setSelectedStyle] = useState('All Styles');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollection, setActiveCollection] = useState(null); // Filter by collection

  // Interaction Panels
  const [showAddCollectionModal, setShowAddCollectionModal] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [newCollectionCover, setNewCollectionCover] = useState('');

  // Save Modal (Assigning Design to collections)
  const [selectedItemForCollection, setSelectedItemForCollection] = useState(null);

  // Compare Panel state
  const [comparingItems, setComparingItems] = useState([]); // holds two items being compared
  const [showCompareModal, setShowCompareModal] = useState(false);

  // Share Modal state
  const [sharingItem, setSharingItem] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  // Custom AI design inputs
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customRoom, setCustomRoom] = useState('Living Room');
  const [customStyle, setCustomStyle] = useState('Scandinavian');
  const [customImage, setCustomImage] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  // Initial Seed & Fetch
  useEffect(() => {
    fetchWishlistData();
  }, []);

  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      setWishlistItems(res.data.data);

      // Extract unique collections from fetched wishlists
      const collMap = new Map();
      res.data.data.forEach((item) => {
        if (item.collectionId) {
          collMap.set(item.collectionId._id, item.collectionId);
        }
      });
      setCollections(Array.from(collMap.values()));

      // Fetch designer shared recommendations
      const sharedRes = await api.get('/wishlist/shared');
      setSharedInspirations(sharedRes.data.data);
    } catch (err) {
      console.error('Failed to load inspirations vault:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add / Create Collection
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;

    try {
      const res = await api.post('/wishlist/collections', {
        title: newCollectionTitle,
        description: newCollectionDesc,
        coverImage: newCollectionCover || undefined
      });
      setCollections((prev) => [...prev, res.data.data]);
      setNewCollectionTitle('');
      setNewCollectionDesc('');
      setNewCollectionCover('');
      setShowAddCollectionModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Save / Toggle custom inspiration
  const handleSaveCustomInspiration = async (e) => {
    e.preventDefault();
    if (!customImage.trim()) return;

    try {
      const res = await api.post('/wishlist/save', {
        roomType: customRoom,
        style: customStyle,
        images: [customImage],
        tags: customTags.split(',').map((t) => t.trim()).filter(Boolean),
        notes: customNotes
      });
      setWishlistItems((prev) => [res.data.data, ...prev]);
      setCustomImage('');
      setCustomTags('');
      setCustomNotes('');
      setShowAddCustomModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Update dynamic wishlist note
  const handleUpdateNote = async (id, notes) => {
    try {
      const res = await api.patch(`/wishlist/${id}/notes`, { notes });
      setWishlistItems((prev) =>
        prev.map((item) => (item._id === id ? { ...item, notes: res.data.data.notes } : item))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Remove saved item
  const handleRemoveItem = async (id) => {
    try {
      await api.delete(`/wishlist/${id}`);
      setWishlistItems((prev) => prev.filter((item) => item._id !== id));
      // Remove from comparison array if present
      setComparingItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Link item to Collection
  const handleLinkToCollection = async (collectionId) => {
    if (!selectedItemForCollection) return;
    const designId = selectedItemForCollection.designId._id;

    try {
      const res = await api.post(`/wishlist/collections/${collectionId}/add`, { designId });
      // Update local state by updating or adding item
      setWishlistItems((prev) => {
        const index = prev.findIndex((item) => item._id === selectedItemForCollection._id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = res.data.data;
          return updated;
        }
        return [res.data.data, ...prev];
      });
      setSelectedItemForCollection(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Compare Selection
  const toggleCompare = (item) => {
    setComparingItems((prev) => {
      const exists = prev.some((x) => x._id === item._id);
      if (exists) {
        return prev.filter((x) => x._id !== item._id);
      }
      if (prev.length >= 2) {
        // limit reached, swap last
        return [prev[0], item];
      }
      return [...prev, item];
    });
  };

  // Clone Designer Curator Recommendation
  const cloneDesignerRecommendation = async (rec) => {
    try {
      const res = await api.post('/wishlist/save', {
        designId: rec._id,
        roomType: rec.roomType,
        style: rec.style,
        images: rec.images,
        tags: rec.tags,
        notes: 'Designer Curated Recommendation'
      });
      setWishlistItems((prev) => [res.data.data, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  // Copy inspiration shared link
  const copyShareLink = (item) => {
    const url = `${window.location.origin}/client/wishlist/share/${item._id}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Filters logic
  const filteredItems = wishlistItems.filter((item) => {
    const design = item.designId;
    if (!design) return false;

    // Room type match
    const matchesRoom = selectedRoom === 'All Rooms' || design.roomType.toLowerCase() === selectedRoom.toLowerCase();
    
    // Style match
    const matchesStyle = selectedStyle === 'All Styles' || design.style.toLowerCase() === selectedStyle.toLowerCase();

    // Query text match
    const text = searchQuery.toLowerCase();
    const matchesQuery =
      searchQuery === '' ||
      design.roomType.toLowerCase().includes(text) ||
      design.style.toLowerCase().includes(text) ||
      (design.tags && design.tags.some((t) => t.toLowerCase().includes(text))) ||
      (item.collectionId && item.collectionId.title.toLowerCase().includes(text));

    // Active collection match
    const matchesCollection = !activeCollection || (item.collectionId && item.collectionId._id === activeCollection._id);

    return matchesRoom && matchesStyle && matchesQuery && matchesCollection;
  });

  return (
    <div className="w-full space-y-8 p-1 sm:p-2">
      
      {/* 1. VAULT BRANDING PANEL */}
      <div className={`p-8 rounded-3xl border ${theme.card} ${theme.shadow} flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden backdrop-blur-md`}>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-800 text-[#F5EBE0] text-[9px] uppercase tracking-widest font-black rounded-full">Inspiration Vault</span>
            <span className="w-2.5 h-2.5 bg-amber-700 rounded-full animate-ping" />
          </div>
          <h1 className={`text-2xl font-nav-style font-extrabold tracking-tight ${theme.text}`}>Scandinavian Moodboard Desk</h1>
          <p className={`text-xs ${theme.textMuted} max-w-xl`}>
            Revisit saved floor plans, sort AI visualizer concepts, organize luxury collections, and compare color palettes side by side.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 z-10 shrink-0">
          <button
            onClick={() => setShowAddCustomModal(true)}
            className="px-4 py-2.5 bg-amber-800 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:scale-102 transition-transform shadow-lg shadow-amber-950/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Add Custom Room
          </button>
          
          <button
            onClick={() => setShowAddCollectionModal(true)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border ${theme.border} hover:scale-102 transition-transform`}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Collection
          </button>

          {comparingItems.length > 0 && (
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-4 py-2.5 bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 hover:scale-102 transition-transform relative animate-pulse"
            >
              <Columns className="w-3.5 h-3.5" />
              Compare ({comparingItems.length})
            </button>
          )}
        </div>
      </div>

      {/* 2. COLLECTION BINDERS ROW */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className={`text-xs font-extrabold uppercase tracking-widest ${theme.text}`}>Inspirational Folders</h3>
          {activeCollection && (
            <button
              onClick={() => setActiveCollection(null)}
              className="text-[10px] font-black text-amber-700 underline uppercase tracking-wider"
            >
              Clear Folder Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveCollection(null)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between h-28 relative overflow-hidden group hover:scale-[1.01] ${
              !activeCollection ? theme.accent : theme.card
            }`}
          >
            <FolderHeart className="w-5 h-5 opacity-60" />
            <div>
              <h4 className="text-xs font-black truncate">General Pool</h4>
              <p className="text-[9px] opacity-60 mt-0.5">{wishlistItems.length} designs saved</p>
            </div>
          </div>

          {collections.map((col) => {
            const isSelected = activeCollection?._id === col._id;
            const count = wishlistItems.filter((item) => item.collectionId?._id === col._id).length;

            return (
              <div
                key={col._id}
                onClick={() => setActiveCollection(col)}
                className={`rounded-2xl border cursor-pointer transition-all relative overflow-hidden h-28 group hover:scale-[1.01] ${
                  isSelected ? 'border-amber-800' : theme.border
                }`}
              >
                <img src={col.coverImage} alt={col.title} className="absolute inset-0 w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 text-[#F5EBE0]">
                  <FolderHeart className="w-5 h-5 opacity-80" />
                  <div className="min-w-0">
                    <h4 className="text-xs font-black truncate">{col.title}</h4>
                    <p className="text-[9px] opacity-75 mt-0.5">{count} designs organized</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. FILTER CONTROLS BAR */}
      <div className={`p-4 rounded-2xl border ${theme.card} flex flex-wrap items-center justify-between gap-4`}>
        {/* Search */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${theme.inputBg} text-xs w-full md:w-60`}>
          <Search className="w-4 h-4 opacity-50" />
          <input
            type="text"
            placeholder="Search tags, style, types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none border-none text-[10px] w-full"
          />
        </div>

        {/* Room Category filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <ListFilter className="w-3.5 h-3.5 opacity-60" />
          <div className="flex flex-wrap gap-1">
            {ROOMS.map((room) => (
              <button
                key={room}
                onClick={() => setSelectedRoom(room)}
                className={`px-3 py-1 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all ${
                  selectedRoom === room ? theme.accent : 'opacity-65 hover:opacity-100'
                }`}
              >
                {room}
              </button>
            ))}
          </div>
        </div>

        {/* Styles Filter */}
        <div className="flex gap-1.5 items-center">
          {STYLES.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStyle(st)}
              className={`px-3 py-1 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all border ${
                selectedStyle === st ? theme.accent : 'border-stone-400/20 opacity-70'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MAIN PINTEREST-STYLE MASONRY GRID */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center">
          <Loader2 className={`w-8 h-8 animate-spin ${theme.textMuted}`} />
          <span className="text-xs opacity-60 mt-3 font-bold uppercase tracking-wider">Loading dynamic moodboards...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center border rounded-3xl border-dashed">
          <ClipboardList className="w-8 h-8 mx-auto opacity-20" />
          <h4 className="text-xs font-bold mt-3">No dynamic inspirations match your filters</h4>
          <p className="text-[10px] opacity-60 mt-1">Try resetting room categories or add custom rooms</p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:balance]">
          <AnimatePresence>
            {filteredItems.map((item) => {
              const design = item.designId;
              const isComparing = comparingItems.some((x) => x._id === item._id);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item._id}
                  className={`break-inside-avoid rounded-3xl overflow-hidden border ${theme.card} group relative flex flex-col`}
                >
                  {/* Photo Container */}
                  <div className="relative aspect-video sm:aspect-square overflow-hidden bg-stone-200">
                    <img
                      src={design?.images[0]}
                      alt="Room Reference"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />

                    {/* Room Style Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      <span className="px-2.5 py-1 bg-black/75 text-white text-[8px] uppercase tracking-widest font-black rounded-full backdrop-blur-sm">
                        {design?.roomType}
                      </span>
                      <span className="px-2.5 py-1 bg-amber-800/85 text-white text-[8px] uppercase tracking-widest font-black rounded-full backdrop-blur-sm">
                        {design?.style}
                      </span>
                    </div>

                    {/* Hover actions drawer */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col justify-between p-4 text-[#F5EBE0]">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() => setSelectedItemForCollection(item)}
                          className="p-2 rounded-xl bg-white/25 hover:bg-white/45 text-white backdrop-blur-md transition-all"
                          title="Assign collection Folder"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleCompare(item)}
                            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
                              isComparing ? 'bg-emerald-600 text-white' : 'bg-white/25 hover:bg-white/45'
                            }`}
                            title="Add to comparative split"
                          >
                            <Columns className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setSharingItem(item)}
                            className="p-2 rounded-xl bg-white/25 hover:bg-white/45 text-white backdrop-blur-md transition-all"
                            title="Share moodboard Link"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-between items-end">
                        <span className="text-[8px] uppercase tracking-widest font-bold opacity-80">
                          Saved {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="p-2 rounded-xl bg-red-800/80 hover:bg-red-800 text-white backdrop-blur-md transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Details and dynamic note fields */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-black/2 dark:bg-white/2">
                    <div className="space-y-1">
                      {item.collectionId && (
                        <span className="text-[9px] uppercase font-bold text-amber-700 flex items-center gap-1">
                          <FolderHeart className="w-3 h-3" />
                          Folder: {item.collectionId.title}
                        </span>
                      )}

                      {design?.tags && design.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {design.tags.map((tag) => (
                            <span key={tag} className="text-[8px] uppercase tracking-wide opacity-60 font-semibold">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dynamic notes input area */}
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
                      <label className="text-[8px] uppercase font-extrabold tracking-wider opacity-65 flex items-center gap-1">
                        <Edit3 className="w-2.5 h-2.5" /> Inspiration Notes
                      </label>
                      <input
                        type="text"
                        placeholder="Add preferences (e.g. warm wood, brass hooks)..."
                        defaultValue={item.notes}
                        onBlur={(e) => handleUpdateNote(item._id, e.target.value)}
                        className={`w-full text-[10px] p-2 rounded-xl border outline-none bg-transparent ${theme.border} text-xs`}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* 5. DESIGNER RECOMMENDATIONS CARDS ROW */}
      <div className="pt-8 border-t border-black/5 dark:border-white/5 space-y-4">
        <div className="space-y-1">
          <h3 className={`text-xs font-extrabold uppercase tracking-widest ${theme.text} flex items-center gap-1.5`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-700" /> Curated Designer Shared Boards
          </h3>
          <p className={`text-[10px] ${theme.textMuted}`}>
            Curated designer setups shared specifically with you. Review and add recommendations directly to your collection drawers!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {sharedInspirations.map((rec) => (
            <div key={rec._id} className={`rounded-2xl border ${theme.card} overflow-hidden relative group`}>
              <div className="aspect-video w-full overflow-hidden relative bg-stone-200">
                <img src={rec.images[0]} alt="Curated recommendation" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-800 text-white text-[7px] uppercase tracking-widest font-black rounded">
                  {rec.roomType}
                </span>
              </div>
              <div className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden border bg-stone-200 flex items-center justify-center font-bold text-[8px] text-white">
                    {rec.designerId?.profileImage ? (
                      <img src={rec.designerId.profileImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      'JD'
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold block truncate">{rec.designerId?.fullName || 'John Designer'}</span>
                    <span className="text-[8px] uppercase tracking-wide opacity-50 block">Lead Designer recommendation</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {rec.tags.map((tag) => (
                    <span key={tag} className="text-[8px] bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => cloneDesignerRecommendation(rec)}
                  className="w-full py-1.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-[9px] uppercase tracking-wider font-extrabold rounded-xl transition-all"
                >
                  Clone to my Moodboard
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. COMPARISON SPLIT VIEW OVERLAY */}
      <AnimatePresence>
        {showCompareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className={`w-full max-w-4xl rounded-3xl border p-6 space-y-6 ${theme.cardInner} relative`}>
              <button
                onClick={() => setShowCompareModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <span className="px-2.5 py-0.5 bg-[#C9B7A7]/50 text-stone-900 rounded-full text-[8px] uppercase tracking-widest font-black">
                  Side-By-Side Style Compare
                </span>
                <h3 className={`text-lg font-black font-nav-style ${theme.text}`}>Contrast saved themes</h3>
              </div>

              {comparingItems.length < 2 ? (
                <div className="py-12 text-center text-xs opacity-60">
                  Select at least two saved rooms to run comparison tests!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x border-t border-black/5 dark:border-white/5 pt-4">
                  {comparingItems.map((item, idx) => {
                    const design = item.designId;
                    return (
                      <div key={item._id} className={`space-y-4 ${idx === 1 ? 'md:pl-6 pt-4 md:pt-0' : ''}`}>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-100">
                          <img src={design?.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wide opacity-50">Room Style</span>
                            <span className="font-bold">{design?.style}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wide opacity-50">Room Type</span>
                            <span className="font-bold">{design?.roomType}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[8px] uppercase tracking-wide opacity-50">Associated Tags</span>
                          <div className="flex flex-wrap gap-1">
                            {design?.tags.map((t) => (
                              <span key={t} className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[9px]">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[8px] uppercase tracking-wide opacity-50">Preference note</span>
                          <p className="text-[10px] italic">{item.notes || 'No preference notes detailed.'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 7. SHARE VAULT MODAL */}
      <AnimatePresence>
        {sharingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className={`w-full max-w-sm rounded-3xl border p-6 space-y-6 ${theme.cardInner} relative`}>
              <button
                onClick={() => setSharingItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <Share2 className="w-8 h-8 text-amber-700 mx-auto" />
                <h3 className="text-xs font-black uppercase tracking-widest">Share design inspirations</h3>
                <p className="text-[10px] opacity-75">Generate public inspiration link to share layout with building contractors or friends!</p>
              </div>

              <div className={`p-3 rounded-2xl border ${theme.border} flex items-center justify-between gap-3 bg-black/5`}>
                <span className="text-[10px] truncate select-all">{window.location.origin}/client/wishlist/share/{sharingItem._id}</span>
                <button
                  onClick={() => copyShareLink(sharingItem)}
                  className="p-2 rounded-xl bg-amber-800 text-white hover:scale-102 transition-transform shrink-0"
                >
                  {linkCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. CREATE COLLECTION MODAL */}
      <AnimatePresence>
        {showAddCollectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <form onSubmit={handleCreateCollection} className={`w-full max-w-sm rounded-3xl border p-6 space-y-4 ${theme.cardInner} relative`}>
              <button
                type="button"
                onClick={() => setShowAddCollectionModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xs font-black uppercase tracking-widest">Create customized inspiration folder</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-extrabold opacity-60 mb-1">Collection Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Modern Villa Balcony, Cozy study nook..."
                    value={newCollectionTitle}
                    onChange={(e) => setNewCollectionTitle(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${theme.inputBg}`}
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-extrabold opacity-60 mb-1">Description</label>
                  <textarea
                    placeholder="Describe design concept highlights..."
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none bg-transparent ${theme.border}`}
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-extrabold opacity-60 mb-1">Cover Image URL</label>
                  <input
                    type="text"
                    placeholder="https://unsplash.com/photos/your-image-url..."
                    value={newCollectionCover}
                    onChange={(e) => setNewCollectionCover(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none bg-transparent ${theme.border}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-800 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all"
              >
                Save Folder Drawer
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 9. ASSIGN COLLECTION PICKER PANEL */}
      <AnimatePresence>
        {selectedItemForCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className={`w-full max-w-sm rounded-3xl border p-6 space-y-4 ${theme.cardInner} relative`}>
              <button
                onClick={() => setSelectedItemForCollection(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xs font-black uppercase tracking-widest text-center">Organize saved Design</h3>
              <p className="text-[10px] opacity-70 text-center">Pick a customized binder to link this layout design inspiration inside</p>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {collections.map((col) => (
                  <div
                    key={col._id}
                    onClick={() => handleLinkToCollection(col._id)}
                    className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-amber-800/10 cursor-pointer flex justify-between items-center transition-colors"
                  >
                    <span className="text-xs font-bold">{col.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 10. ADD CUSTOM ROOM INSPIRATION MODAL */}
      <AnimatePresence>
        {showAddCustomModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <form onSubmit={handleSaveCustomInspiration} className={`w-full max-w-sm rounded-3xl border p-6 space-y-4 ${theme.cardInner} relative`}>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xs font-black uppercase tracking-widest">Incorporate design bookmarks</h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-extrabold opacity-60 mb-1">Room Category</label>
                    <select
                      value={customRoom}
                      onChange={(e) => setCustomRoom(e.target.value)}
                      className={`w-full p-2 rounded-xl border outline-none bg-transparent ${theme.border}`}
                    >
                      {ROOMS.filter((r) => r !== 'All Rooms').map((room) => (
                        <option key={room} value={room} className="text-black">{room}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] uppercase tracking-wider font-extrabold opacity-60 mb-1">Theme Style</label>
                    <select
                      value={customStyle}
                      onChange={(e) => setCustomStyle(e.target.value)}
                      className={`w-full p-2 rounded-xl border outline-none bg-transparent ${theme.border}`}
                    >
                      {STYLES.filter((s) => s !== 'All Styles').map((style) => (
                        <option key={style} value={style} className="text-black">{style}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-extrabold opacity-60 mb-1">Image URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={customImage}
                    onChange={(e) => setCustomImage(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none bg-transparent ${theme.border}`}
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-extrabold opacity-60 mb-1">Design Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. limewash, brass hooks, plant box..."
                    value={customTags}
                    onChange={(e) => setCustomTags(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none bg-transparent ${theme.border}`}
                  />
                </div>

                <div>
                  <label className="block text-[8px] uppercase tracking-wider font-extrabold opacity-60 mb-1">Inspiration notes</label>
                  <textarea
                    placeholder="Prefers warm amber lights here..."
                    value={customNotes}
                    onChange={(e) => setCustomNotes(e.target.value)}
                    className={`w-full p-2 rounded-xl border outline-none bg-transparent ${theme.border}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-800 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all"
              >
                Save Inspiration to Vault
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
