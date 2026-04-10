import { useNavigate, useParams } from "react-router";
import { ChevronLeft, EyeOff, Eye, Info, Loader2, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export function HideItinerary() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isHidden, setIsHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "trips", id), (snap) => {
      if (snap.exists()) setIsHidden(snap.data().isItineraryHidden ?? false);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleToggle = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "trips", id), { isItineraryHidden: !isHidden });
      toast.success(!isHidden ? "Itinerariu ascuns!" : "Itinerariu vizibil!");
    } catch (e) { toast.error("Eroare la salvare."); } finally { setIsUpdating(false); }
  };

  if (loading) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors p-6">
      <div className="max-w-xl mx-auto py-12">
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 text-center shadow-xl border border-gray-100 dark:border-gray-800">
          <div className={`w-24 h-24 rounded-[2rem] mx-auto flex items-center justify-center mb-8 transition-all duration-500 shadow-2xl ${isHidden ? 'bg-indigo-600 text-white rotate-6' : 'bg-gray-100 dark:bg-gray-800 text-indigo-500'}`}>
            {isHidden ? <EyeOff className="w-12 h-12" /> : <Eye className="w-12 h-12" />}
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4">Modul Surpriză</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium px-4">
            {isHidden ? "Momentan, doar tu poți vedea planul. Restul grupului va vedea secțiunea 'Itinerariu' blocată." : "Toți membrii grupului pot vedea programul complet al călătoriei în timp real."}
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl flex gap-4 text-left mb-10 border border-blue-100 dark:border-blue-800">
            <ShieldAlert className="w-6 h-6 text-blue-600 shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200 font-bold">Această setare este utilă pentru a pregăti surprize sau pentru a finaliza detaliile fără a crea confuzie în grup.</p>
          </div>

          <button onClick={handleToggle} disabled={isUpdating} className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 text-white shadow-xl ${isHidden ? 'bg-gray-900 dark:bg-indigo-700' : 'bg-indigo-600'}`}>
            {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : isHidden ? "Dezvăluie Planul" : "Ascunde Itinerariul"}
          </button>
          
          <button onClick={() => navigate(-1)} className="mt-6 text-gray-400 font-bold uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">Mergi înapoi</button>
        </div>
      </div>
    </div>
  );
}