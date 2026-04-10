import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Lock, Unlock, Loader2, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function LockItinerary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
      else setAuthLoading(false);
    });
    if (!id) return;
    const unsubData = onSnapshot(doc(db, "trips", id), (snap) => {
      if (snap.exists()) setIsLocked(snap.data().isLocked ?? false);
      setLoading(false);
    });
    return () => { unsubAuth(); unsubData(); };
  }, [id, navigate]);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "trips", id!), { isLocked: !isLocked });
      toast.success(!isLocked ? "Itinerariu blocat!" : "Itinerariu deblocat!");
    } catch (e) { toast.error("Eroare la salvare."); } finally { setIsUpdating(false); }
  };

  if (authLoading || loading) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors p-6">
      <div className="max-w-2xl mx-auto py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-black uppercase text-[10px] tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Înapoi
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 text-center shadow-xl border border-gray-100 dark:border-gray-800">
          <div className={`w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center mb-8 transition-all duration-500 shadow-2xl ${isLocked ? 'bg-red-600 text-white scale-110' : 'bg-green-100 dark:bg-green-900/30 text-green-600'}`}>
            {isLocked ? <Lock className="w-12 h-12" /> : <Unlock className="w-12 h-12" />}
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">
            {isLocked ? "Itinerariu Blocat" : "Itinerariu Deschis"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium max-w-sm mx-auto">
            {isLocked 
              ? "Modul de editare este dezactivat pentru toți membrii. Nimeni nu mai poate adăuga sau schimba activități." 
              : "Toți membrii pot propune, vota sau șterge elemente din planul de călătorie."}
          </p>

          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-3xl flex gap-4 text-left mb-10 border border-amber-100 dark:border-amber-800">
            <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200 font-bold">Această funcție asigură faptul că planul final rămâne neschimbat înainte de plecare.</p>
          </div>

          <button onClick={handleToggle} disabled={isUpdating} className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 text-white shadow-xl ${isLocked ? 'bg-green-600' : 'bg-red-600'}`}>
            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isLocked ? "Deblochează Itinerariul" : "Blochează Itinerariul"}
          </button>
        </div>
      </div>
    </div>
  );
}