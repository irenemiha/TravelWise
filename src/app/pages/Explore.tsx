import { useParams, Link, useNavigate } from "react-router";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  ThumbsUp,
  ThumbsDown,
  Search,
  Heart,
  Loader2,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { 
  collection, 
  doc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export interface Attraction {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  votes: { up: number; down: number };
  category: string;
  location: string;
  duration: string;
  price: string;
  saved: boolean;
  userVote: "up" | "down" | null;
}

export function Explore() {
  const { id } = useParams();
  const tripId = id || "";
  const navigate = useNavigate();

  const [trip, setTrip] = useState<any>(null);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const [userSavedIds, setUserSavedIds] = useState<string[]>([]);
  const [votesData, setVotesData] = useState<{[key: string]: any}>({});

  // 1. GESTIONARE AUTH ȘI DATE TRIP (Rezolvă bug-ul de redirect)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
        return;
      }
      setAuthLoading(false);

      // Ascultăm datele Trip-ului
      const tripRef = doc(db, "trips", tripId);
      const unsubTrip = onSnapshot(tripRef, (snap) => {
        if (snap.exists()) {
          setTrip({ id: snap.id, ...snap.data() });
        } else {
          toast.error("Călătoria nu a fost găsită");
          navigate("/dashboard");
        }
      });

      // Ascultăm favoritele userului
      const userRef = doc(db, "users", user.uid);
      const unsubUser = onSnapshot(userRef, (snap) => {
        if (snap.exists()) {
          setUserSavedIds(snap.data().savedAttractions || []);
        }
      });

      return () => { unsubTrip(); unsubUser(); };
    });

    return () => unsubscribeAuth();
  }, [tripId, navigate]);

  // 2. ASCULTĂ VOTURILE REALE (Subcolecția din Firebase)
  useEffect(() => {
    if (!tripId || authLoading) return;
    const votesRef = collection(db, "trips", tripId, "attractionVotes");
    const unsubVotes = onSnapshot(votesRef, (snapshot) => {
      const votesMap: any = {};
      snapshot.docs.forEach(doc => { votesMap[doc.id] = doc.data(); });
      setVotesData(votesMap);
    });
    return () => unsubVotes();
  }, [tripId, authLoading]);

  // 3. FETCH LOCAȚII REALE (GEOAPIFY)
  useEffect(() => {
    if (!trip?.destination) return;
    const cityName = trip.destination.split(",")[0].trim();
    const cacheKey = `explore_cache_${cityName}`;

    const fetchPlaces = async () => {
      const savedCache = localStorage.getItem(cacheKey);
      if (savedCache) {
        setAttractions(JSON.parse(savedCache));
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`);
        const geoData = await geoRes.json();
        if (!geoData || geoData.length === 0) return;
        const { lat, lon } = geoData[0];
        
        const API_KEY = "6627c045fcd14d76b5b547c8f3c54d17";
        const response = await fetch(
          `https://api.geoapify.com/v2/places?categories=tourism.attraction,catering.restaurant,entertainment.museum&filter=circle:${lon},${lat},5000&limit=30&lang=ro&apiKey=${API_KEY}`
        );
        const data = await response.json();
        
        const mappedData: Attraction[] = data.features.map((f: any) => {
          const p = f.properties;
          const cleanName = (p.name || "Locație").split(/[($]/)[0].trim();
          const category = p.categories.includes("catering.restaurant") ? "Restaurante" : p.categories.includes("entertainment.museum") ? "Muzee" : "Atracții";
          
          return {
            id: p.place_id,
            name: cleanName,
            description: `O destinație populară în ${cityName}, perfectă pentru grupul tău.`,
            image: `https://tse1.mm.bing.net/th?q=${encodeURIComponent(cleanName + " " + cityName)}&w=800&h=450&c=1&p=0`, 
            rating: parseFloat((4.0 + (Math.random() * 0.9)).toFixed(1)),
            votes: { up: 0, down: 0 },
            category: category,
            location: cityName,
            duration: category === "Restaurante" ? "1-2 ore" : "2-3 ore",
            price: category === "Muzee" ? "15-25 €" : "20-50 €",
            saved: false,
            userVote: null
          };
        });

        localStorage.setItem(cacheKey, JSON.stringify(mappedData));
        setAttractions(mappedData);
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaces();
  }, [trip?.destination]);

  // 4. HANDLERS (PERSISTENȚĂ FIREBASE)
  const handleVote = async (attractionId: string, type: "up" | "down") => {
    if (!auth.currentUser || !tripId) return;
    const userId = auth.currentUser.uid;
    const voteDocRef = doc(db, "trips", tripId, "attractionVotes", attractionId);
    
    const currentData = votesData[attractionId] || { up: 0, down: 0, voters: {} };
    const previousVote = currentData.voters?.[userId] || null;
    
    let newUp = currentData.up || 0;
    let newDown = currentData.down || 0;
    let newVoters = { ...(currentData.voters || {}) };

    if (previousVote === type) {
      type === "up" ? newUp-- : newDown--;
      delete newVoters[userId];
    } else {
      if (previousVote === "up") newUp--;
      if (previousVote === "down") newDown--;
      type === "up" ? newUp++ : newDown++;
      newVoters[userId] = type;
    }

    await setDoc(voteDocRef, { up: Math.max(0, newUp), down: Math.max(0, newDown), voters: newVoters });
  };

  const toggleSave = async (id: string) => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const isCurrentlySaved = userSavedIds.includes(id);

    try {
      if (isCurrentlySaved) {
        await updateDoc(userRef, { savedAttractions: arrayRemove(id) });
        toast.info("Eliminat din favorite");
      } else {
        await updateDoc(userRef, { savedAttractions: arrayUnion(id) });
        toast.success("Salvat!");
      }
    } catch (e) { toast.error("Eroare Firebase"); }
  };

  const categories = ["all", "Restaurante", "Muzee", "Atracții"];

  const filteredAttractions = attractions.filter((attr) => {
    const matchesSearch = attr.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || attr.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (authLoading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-8">
      {/* Header Sticky */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                Explorează {trip?.destination?.split(',')[0]}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Sincronizat live cu grupul tău</p>
            </div>
            <Link to={`/trip/${tripId}`} className="text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-widest border-b-2 border-blue-600">
              ← Înapoi
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Caută în locații..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white font-bold transition-all"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`font-black px-6 py-4 rounded-2xl whitespace-nowrap transition-all text-xs uppercase tracking-widest ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                      : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {cat === "all" ? "Toate" : cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Statistics Bar */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 mb-8 border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
          <div className="flex gap-10">
            <div>
              <div className="text-2xl font-black text-blue-600">{userSavedIds.length}</div>
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Salvate</div>
            </div>
            <div>
              <div className="text-2xl font-black text-purple-600">{attractions.length}</div>
              <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Disponibile</div>
            </div>
          </div>
          <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl">
            {filteredAttractions.length} rezultate
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="font-black uppercase text-[10px] tracking-[0.3em] text-gray-400">Încărcăm destinații...</p>
            </div>
          ) : filteredAttractions.map((attraction) => {
            const persistentVote = votesData[attraction.id] || { up: 0, down: 0, voters: {} };
            const userVote = persistentVote.voters?.[auth.currentUser?.uid || ""] || null;
            const isSaved = userSavedIds.includes(attraction.id);

            return (
              <div key={attraction.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 group hover:shadow-2xl transition-all duration-500">
                <div className="relative h-60 flex">
                  <ImageWithFallback src={attraction.image} alt={attraction.name} className="w-full h-full min-w-full min-h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <button onClick={() => toggleSave(attraction.id)} className="absolute top-5 right-5 w-12 h-12 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-xl">
                    <Heart className={`w-6 h-6 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
                  </button>
                  <div className="absolute top-5 left-5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg">
                    {attraction.category}
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{attraction.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2 font-medium leading-relaxed">{attraction.description}</p>

                  <div className="flex gap-6 mb-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
                    <div className="flex items-center gap-2"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> <span className="text-gray-900 dark:text-white">{attraction.rating}</span></div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-blue-500" /> {attraction.duration}</div>
                    <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500" /> {attraction.price}</div>
                  </div>

                  <div className="border-t dark:border-gray-800 pt-6 flex items-center justify-between">
                    <div className="flex gap-3">
                      <button onClick={() => handleVote(attraction.id, "up")} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${userVote === "up" ? "bg-green-500 text-white shadow-lg shadow-green-500/30" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                        <ThumbsUp className="w-4 h-4" /> {persistentVote.up || 0}
                      </button>
                      <button onClick={() => handleVote(attraction.id, "down")} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${userVote === "down" ? "bg-red-500 text-white shadow-lg shadow-red-500/30" : "bg-gray-100 dark:bg-gray-800 text-gray-500"}`}>
                        <ThumbsDown className="w-4 h-4" /> {persistentVote.down || 0}
                      </button>
                    </div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(attraction.name + " " + attraction.location)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}