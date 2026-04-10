import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function PrivacySettings() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
      else setAuthLoading(false);
    });
    if (!id) return;
    const unsub = onSnapshot(doc(db, "trips", id), (snap) => {
      if (snap.exists()) setIsPrivate(snap.data().isPrivate ?? true);
      setLoading(false);
    });
    return () => unsub();
  }, [id, navigate]);

  const handleToggle = async () => {
    try {
      await updateDoc(doc(db, "trips", id!), { isPrivate: !isPrivate });
      toast.success(!isPrivate ? "Călătorie privată" : "Călătorie publică");
    } catch (e) { toast.error("Eroare."); }
  };

  if (authLoading || loading) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6">
      <div className="max-w-xl mx-auto py-12">
        <button onClick={() => navigate(-1)} className="mb-8 text-gray-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all"><ChevronLeft className="w-4 h-4"/> Înapoi</button>
        
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
           <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-6"><ShieldCheck className="w-8 h-8"/></div>
           <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Confidențialitate</h1>
           <p className="text-gray-500 dark:text-gray-400 font-medium mb-10">Controlează cine poate descoperi această călătorie în afara grupului.</p>

           <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl flex items-center justify-between border border-gray-100 dark:border-gray-700">
              <div className="text-left">
                <p className="font-black text-gray-900 dark:text-white uppercase text-[11px] tracking-widest mb-1">Mod Privat</p>
                <p className="text-xs text-gray-500 font-bold">Ascunde călătoria din căutări.</p>
              </div>
              <button 
                onClick={handleToggle}
                className={`w-14 h-8 rounded-full transition-all relative ${isPrivate ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${isPrivate ? 'right-1' : 'left-1'}`} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}