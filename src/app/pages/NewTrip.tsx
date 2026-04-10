import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { X, MapPin, Compass, ChevronRight, Check, Plus, Search, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// Importăm Firebase
import { db, auth } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function NewTrip() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCopyBadge, setShowCopyBadge] = useState(false);

  // --- LOGICA COPIERE LINK ---
  const handleCopyInviteLink = () => {
    const baseUrl = window.location.origin;
    const inviteText = `Bună! Te invit să planificăm împreună călătoria "${name || 'nouă'}" pe TravelWise! Alătură-te aici: ${baseUrl}/join/pending`;
    
    navigator.clipboard.writeText(inviteText).then(() => {
      setShowCopyBadge(true);
      setTimeout(() => setShowCopyBadge(false), 2000);
      toast.success("Link copiat!");
    });
  };

  // --- LOGICA GEONAMES (Căutare orașe) ---
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (destination.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const USERNAME = "irenemiha"; 
        const response = await fetch(
          `https://secure.geonames.org/searchJSON?q=${encodeURIComponent(destination)}&maxRows=10&username=${USERNAME}&lang=ro&featureClass=P&style=full`
        );
        const data = await response.json();
        if (data.geonames) setSearchResults(data.geonames);
      } catch (error) {
        console.error("GeoNames error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [destination]);

  const handleAddEmail = () => {
    if (emailInput && emailInput.includes("@") && !invitedEmails.includes(emailInput)) {
      setInvitedEmails([...invitedEmails, emailInput]);
      setEmailInput("");
    }
  };

  const removeEmail = (email: string) => {
    setInvitedEmails(prev => prev.filter(e => e !== email));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error("Trebuie să fii logat!");
      return;
    }
    setIsCreating(true);

    try {
      const tripData = {
        name,
        destination,
        startDate,
        endDate,
        ownerId: auth.currentUser.uid,
        participants: [auth.currentUser.uid],
        invitedEmails,
        image: "",
        status: "planning",
        createdAt: serverTimestamp(),
        votesCount: 0,
        attractionsCount: 0
      };

      const docRef = await addDoc(collection(db, "trips"), tripData);
      toast.success("Aventura a fost creată!");
      navigate(`/trip/${docRef.id}`); // Mergem direct la planificarea ei
    } catch (error) {
      toast.error("Eroare la salvare.");
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = name && destination && startDate && endDate && !isCreating;

  return (
    <div className="bg-gradient-to-r from-blue-950 via-purple-900 to-fuchsia-950 transition-colors duration-300 min-h-[calc(100vh-64px)] flex flex-col items-center py-12 px-4 overflow-x-hidden">
      
      {/* BADGE ANIMAT COPIERE */}
      <AnimatePresence>
        {showCopyBadge && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-12 z-[100] bg-blue-600 text-white py-4 px-8 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20"
          >
            <Check className="w-5 h-5" />
            <span className="font-bold text-sm">Link de invitație copiat!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 p-8 md:p-12">
        <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <Compass className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Planifică o aventură</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Creează o nouă călătorie și invită-ți prietenii!</p>
        </div>
        
        <form onSubmit={handleCreate} className="space-y-8">
          {/* Nume */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Numele Călătoriei</label>
            <input 
              type="text" value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="Ex: Vacanță în Grecia..." 
              className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>

          {/* Destinație cu Autocomplete */}
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Destinația principală</label>
            <div className="relative group">
              <input 
                type="text" value={destination} onFocus={() => setShowDropdown(true)}
                onChange={(e) => { setDestination(e.target.value); setShowDropdown(true); }}
                placeholder="Caută un oraș..." required
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 transition-all"
              />
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                {isSearching ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" /> : <Search className="w-5 h-5 text-gray-400" />}
              </div>
            </div>

            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.geonameId} type="button"
                    onClick={() => { setDestination(`${result.name}, ${result.countryName}`); setShowDropdown(false); }}
                    className="w-full text-left p-4 hover:bg-blue-50 dark:hover:bg-blue-900/40 border-b border-gray-50 dark:border-gray-700 last:border-none flex items-center gap-3"
                  >
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{result.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase font-black">{result.countryName}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Plecare</label>
              <input 
                type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required 
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Întoarcere</label>
              <input 
                type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required min={startDate}
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600" 
              />
            </div>
          </div>

          {/* Invitații */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Invită Prieteni</label>
            <div className="flex gap-3">
              <input
                type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEmail())}
                placeholder="Email prieten..."
                className="flex-1 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl p-5 font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600"
              />
              <button type="button" onClick={handleCopyInviteLink} className="p-5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-800">
                <LinkIcon className="w-6 h-6" />
              </button>
            </div>

            {invitedEmails.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {invitedEmails.map(email => (
                  <div key={email} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md">
                    {email}
                    <X className="w-3 h-3 cursor-pointer hover:scale-125" onClick={() => removeEmail(email)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button 
            type="submit" disabled={!isFormValid}
            className={`w-full font-black py-6 rounded-3xl shadow-2xl flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest ${
              isFormValid ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-500/30" : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isCreating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Creează aventura"}
            {!isCreating && <ChevronRight className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}