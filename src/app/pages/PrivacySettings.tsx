import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Lock, Loader2, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function PrivacySettings() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [trip, setTrip] = useState<{ name: string } | null>(null);

  // 1. PROTECȚIE RUTĂ + ASCULTARE STATUS ȘI NUME TRIP
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
      else setAuthLoading(false);
    });

    if (!id) return;

    const tripRef = doc(db, "trips", id);
    const unsubscribe = onSnapshot(tripRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTrip(data as { name: string });
        setIsPrivate(data.isPrivate ?? true);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubscribe();
    };
  }, [id, navigate]);

  // 2. LOGICĂ DE UPDATE ÎN TIMP REAL
  const handleToggle = async () => {
    if (!id) return;

    const newValue = !isPrivate;
    
    try {
      const tripRef = doc(db, "trips", id);
      await updateDoc(tripRef, {
        isPrivate: newValue
      });
      
      toast.success(newValue ? "Călătoria este acum privată" : "Călătoria este acum publică");
    } catch (error) {
      console.error("Privacy update error:", error);
      toast.error("Nu s-au putut salva setările.");
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
      {/* Header - Stil Aplicație cu Subtitlu Trip Name */}
      <div className="bg-white dark:bg-gray-900 p-4 flex items-center border-b dark:border-gray-800 sticky top-0 z-10 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
        <div className="ml-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors leading-none font-black">
            Confidențialitate
          </h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 uppercase tracking-widest leading-none">{trip?.name}</p>
        </div>
      </div>

      <div className="p-6 space-y-4 max-w-md mx-auto py-10">
        <p className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-widest uppercase ml-1 mb-4">
          Setări Vizibilitate
        </p>

        {/* Cardul de Setări - Stil Aplicație */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 p-6 shadow-xl shadow-gray-200/50 dark:shadow-none transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-left">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-2xl transition-colors">
                <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">Călătorie Privată</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                  Doar membrii grupului pot vedea planul
                </p>
              </div>
            </div>
            
            {/* Toggle Real Time - Stil Aplicație */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isPrivate} 
                onChange={handleToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 transition-colors"></div>
            </label>
          </div>
        </div>

        {/* Info Box - Stil Aplicație */}
        <div className="mt-8 p-5 bg-gray-100 dark:bg-gray-900/50 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic leading-relaxed font-medium">
            Când modul privat este activat, călătoria nu va apărea în rezultatele de căutare publice sau în profilul tău public.
          </p>
        </div>
      </div>
    </div>
  );
}