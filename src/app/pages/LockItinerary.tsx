import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Lock, Unlock, Loader2, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function LockItinerary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const tripId = id || "";

  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [trip, setTrip] = useState<{ name: string } | null>(null);

  // 1. PROTECȚIE RUTĂ + ASCULTARE FIRESTORE (STATUS + NUME)
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
        setIsLocked(data.isLocked ?? false);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubscribe();
    };
  }, [tripId, navigate]);

  // 2. LOGICA DE TOGGLE REALĂ
  const handleToggle = async () => {
    if (!tripId) return;

    const newState = !isLocked;
    setIsUpdating(true);

    try {
      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        isLocked: newState
      });
      
      toast.success(newState ? "Itinerariu blocat cu succes!" : "Itinerariu deblocat pentru editare!");
    } catch (error) {
      console.error("Lock toggle error:", error);
      toast.error("Nu s-a putut schimba starea itinerariului.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 min-h-screen">
      {/* Header - Stil Unificat */}
      <div className="bg-white dark:bg-gray-900 p-4 flex items-center border-b dark:border-gray-800 sticky top-0 z-10 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
        <div className="ml-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors leading-none tracking-tighter">
            Blochează Itinerariul
          </h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 uppercase tracking-widest leading-none">{trip?.name}</p>
        </div>
      </div>

      <div className="p-6 flex flex-col items-center text-center max-w-md mx-auto py-10">
        {/* Status Icon Container - Stil Aplicație */}
        <div className={`p-10 rounded-[2.5rem] mb-8 transition-all duration-500 transform shadow-2xl ${
          isLocked 
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 scale-110' 
            : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 scale-100'
        }`}>
          {isLocked ? <Lock className="w-16 h-16" /> : <Unlock className="w-16 h-16" />}
        </div>
        
        <h2 className="text-2xl font-black mb-3 text-gray-900 dark:text-white transition-colors uppercase tracking-tight">
          {isLocked ? "Itinerariu Blocat" : "Itinerariu Deschis"}
        </h2>
        
        <p className="text-gray-500 dark:text-gray-400 mb-10 transition-colors leading-relaxed font-medium">
          {isLocked 
            ? "Modul de editare este dezactivat. Nimeni nu mai poate adăuga, vota sau șterge activități din planul curent." 
            : "Toți membrii grupului au permisiunea de a propune locații noi și de a vota destinațiile preferate."}
        </p>

        {/* Toggle Action Button */}
        <button 
          onClick={handleToggle}
          disabled={isUpdating}
          className={`w-full py-5 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
            isLocked 
              ? 'bg-green-600 shadow-green-600/20' 
              : 'bg-red-600 shadow-red-600/20'
          } disabled:opacity-50`}
        >
          {isUpdating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            isLocked ? "Deblochează pentru Editare" : "Blochează Itinerariul"
          )}
        </button>
        
        {/* Note Box - Stil Website */}
        <div className="mt-10 p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30 transition-colors flex gap-4 text-left">
           <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
           <p className="text-sm text-amber-800 dark:text-amber-200 font-medium leading-relaxed">
             <strong>Notă:</strong> Această funcție asigură faptul că planul final rămâne neschimbat înainte de plecare. Membrii pot vizualiza în continuare totul.
           </p>
        </div>
      </div>
    </div>
  );
}