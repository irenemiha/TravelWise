import { useNavigate, useParams } from "react-router";
import { ChevronLeft, EyeOff, Eye, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function HideItinerary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const tripId = id || "";

  const [isHidden, setIsHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [trip, setTrip] = useState<{ name: string } | null>(null);

  // 1. PROTECȚIE RUTĂ + ASCULTĂM FIRESTORE (STATUS + NUME)
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
      else setAuthLoading(false);
    });

    if (!tripId) return;

    const tripRef = doc(db, "trips", tripId);
    const unsubscribe = onSnapshot(tripRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTrip(data as { name: string });
        setIsHidden(data.isItineraryHidden ?? false);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubscribe();
    };
  }, [tripId, navigate]);

  // 2. LOGICA DE TOGGLE
  const handleToggle = async () => {
    if (!tripId) return;

    const newState = !isHidden;
    setIsUpdating(true);

    try {
      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        isItineraryHidden: newState
      });
      
      if (newState) {
        toast.warning("Itinerariul a fost ascuns pentru ceilalți membri!");
      } else {
        toast.success("Itinerariul este acum vizibil pentru tot grupul.");
      }
    } catch (error) {
      console.error("Hide toggle error:", error);
      toast.error("Eroare la schimbarea vizibilității.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 min-h-screen">
      {/* Header - Stil Unificat cu Subtitlu Trip Name */}
      <div className="bg-white dark:bg-gray-900 p-4 flex items-center border-b dark:border-gray-800 sticky top-0 z-10 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
        <div className="ml-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors leading-none tracking-tighter">
            Ascunde Itinerariul
          </h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 uppercase tracking-widest leading-none">{trip?.name}</p>
        </div>
      </div>

      <div className="p-6 flex flex-col items-center max-w-md mx-auto py-10">
        {/* Ilustrație Stare - Stil Aplicație */}
        <div className={`w-28 h-28 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 shadow-2xl ${
          isHidden 
            ? 'bg-indigo-600 text-white rotate-6 scale-110' 
            : 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-100 dark:border-indigo-900/50'
        }`}>
          {isHidden ? <EyeOff className="w-14 h-14" /> : <Eye className="w-14 h-14" />}
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4 transition-colors uppercase tracking-tight">
            {isHidden ? "Planul este Ascuns" : "Planul este Vizibil"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed transition-colors font-medium">
            {isHidden 
              ? "Momentan, doar tu (administratorul) poți vedea activitățile. Restul grupului va vedea secțiunea 'Itinerariu' blocată." 
              : "Toți membrii grupului pot vedea în timp real programul complet și locațiile confirmate."}
          </p>
        </div>

        {/* Info Box - Stil Aplicație */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 p-6 rounded-3xl flex gap-4 mb-10 w-full transition-colors">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-snug font-bold">
            Poți folosi această opțiune pentru a organiza o <strong>călătorie surpriză</strong> sau pentru a finaliza planul fără a crea confuzie în grup.
          </p>
        </div>

        {/* Toggle Button - Stil Aplicație adaptat */}
        <button 
          onClick={handleToggle}
          disabled={isUpdating}
          className={`w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${
            isHidden 
              ? 'bg-gray-900 dark:bg-indigo-700 shadow-gray-200 dark:shadow-none' 
              : 'bg-indigo-600 shadow-indigo-600/20 dark:shadow-none'
          } disabled:opacity-50`}
        >
          {isUpdating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            isHidden ? "Dezvăluie Itinerariul" : "Ascunde Itinerariul"
          )}
        </button>
      </div>
    </div>
  );
}