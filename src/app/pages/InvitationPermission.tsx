import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export function InvitationPermissions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const tripId = id || "";

  const [selected, setSelected] = useState("admin");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [trip, setTrip] = useState<{ name: string } | null>(null);

  const options = [
    { id: "all", title: "Oricine din grup", desc: "Toți membrii pot invita persoane noi." },
    { id: "admin", title: "Doar Administratorii", desc: "Doar tu și ceilalți admini puteți trimite invitații." },
  ];

  // 1. ASCULTĂM SETĂRILE DIN FIRESTORE ÎN TIMP REAL
  useEffect(() => {
    if (!tripId) return;

    const tripRef = doc(db, "trips", tripId);
    const unsubscribe = onSnapshot(tripRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        // DEFINIREA VARIABILEI TRIP AICI:
        setTrip(data as any);
        setSelected(data.invitationPolicy || "admin");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [tripId]);

  // 2. SALVĂM SCHIMBAREA CU FEEDBACK VIZUAL (isUpdating)
  const handleSelect = async (optionId: string) => {
    if (!tripId || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        invitationPolicy: optionId
      });
      toast.success("Permisiuni actualizate!");
    } catch (error) {
      console.error("Error updating permissions:", error);
      toast.error("Nu s-au putut salva setările.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 min-h-screen">
      {/* Header - Sincronizat cu stilul aplicației */}
      <div className="bg-white dark:bg-gray-900 p-4 flex items-center border-b dark:border-gray-800 sticky top-0 z-10 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-all"
        >
          <ChevronLeft className="w-6 h-6 text-gray-900 dark:text-white" />
        </button>
        <div className="ml-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight leading-none">Permisiuni Invitație</h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 uppercase tracking-widest leading-none">{trip?.name}</p>
        </div>
      </div>

      <div className="p-6 space-y-3 max-w-md mx-auto py-10">
        <p className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-widest uppercase ml-1 mb-6">
          Cine poate trimite link-uri?
        </p>
        
        {/* Container Opțiuni cu feedback la update */}
        <div className={`transition-opacity duration-300 ${isUpdating ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
          {options.map((opt) => (
            <button 
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full p-6 rounded-[24px] border text-left transition-all active:scale-[0.98] mb-4 last:mb-0 ${
                selected === opt.id 
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500 shadow-lg shadow-blue-500/5' 
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-none'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`font-black text-lg ${
                  selected === opt.id 
                    ? 'text-blue-700 dark:text-blue-400' 
                    : 'text-gray-900 dark:text-gray-100'
                }`}>
                  {opt.title}
                </span>
                {selected === opt.id && (
                  <div className="bg-blue-600 dark:bg-blue-500 p-1.5 rounded-full shadow-md">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {opt.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Box informativ de la final */}
        <div className="mt-10 p-5 bg-gray-100 dark:bg-gray-900/50 rounded-[2rem] border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center italic leading-relaxed font-medium">
            Această setare poate fi modificată oricând de către administratorii călătoriei pentru a controla cine are acces în grup.
          </p>
        </div>
      </div>
    </div>
  );
}