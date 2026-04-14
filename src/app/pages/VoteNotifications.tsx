import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function VoteNotifications() {
  const navigate = useNavigate();
  const { id } = useParams();
  const tripId = id || "";

  const [settings, setSettings] = useState({
    everyVote: true,
    summary: false,
    chatAlerts: true
  });
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
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
        if (data.voteSettings) {
          setSettings(data.voteSettings);
        }
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubscribe();
    };
  }, [tripId, navigate]);

  // 2. LOGICA DE UPDATE ÎN TIMP REAL
  const toggle = async (key: keyof typeof settings) => {
    if (!tripId) return;

    const newSettings = { ...settings, [key]: !settings[key] };
    setIsUpdating(true);

    try {
      const tripRef = doc(db, "trips", tripId);
      await updateDoc(tripRef, {
        voteSettings: newSettings
      });
      toast.success("Preferințe actualizate!");
    } catch (error) {
      console.error("Notification settings error:", error);
      toast.error("Nu s-au putut salva modificările.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
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
            Alerte Voturi
          </h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 uppercase tracking-widest leading-none">{trip?.name}</p>
        </div>
      </div>

      <div className="p-6 space-y-4 max-w-md mx-auto py-10">
        <p className="text-xs font-black text-gray-400 dark:text-gray-500 tracking-widest uppercase ml-1 mb-2">
          Preferințe Notificări
        </p>

        {/* Listă Setări - Stil Aplicație */}
        <div className={`bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 divide-y dark:divide-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden transition-all ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {/* Fiecare vot */}
          <label className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
            <div className="flex-1 pr-4">
              <p className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">Fiecare vot nou</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5 font-medium">
                Notificare instant când cineva votează.
              </p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.everyVote} 
              onChange={() => toggle('everyVote')} 
              className="w-6 h-6 rounded-lg accent-pink-500 cursor-pointer transition-transform group-active:scale-90" 
            />
          </label>

          {/* Rezumat zilnic */}
          <label className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
            <div className="flex-1 pr-4">
              <p className="font-bold text-gray-900 dark:text-gray-100  tracking-tight">Rezumat zilnic</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5 font-medium">
                Un raport zilnic cu toate voturile zilei.
              </p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.summary} 
              onChange={() => toggle('summary')} 
              className="w-6 h-6 rounded-lg accent-pink-500 cursor-pointer transition-transform group-active:scale-90" 
            />
          </label>

          {/* Alerte pe Chat */}
          <label className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
            <div className="flex-1 pr-4">
              <p className="font-bold text-gray-900 dark:text-gray-100 tracking-tight">Alerte pe Chat</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5 font-medium">
                Mesaje automate în chat la fiecare vot.
              </p>
            </div>
            <input 
              type="checkbox" 
              checked={settings.chatAlerts} 
              onChange={() => toggle('chatAlerts')} 
              className="w-6 h-6 rounded-lg accent-pink-500 cursor-pointer transition-transform group-active:scale-90" 
            />
          </label>
        </div>

        {/* Info box - Stil Aplicație */}
        <div className="mt-8 p-5 bg-pink-50 dark:bg-pink-900/10 rounded-[2rem] border border-pink-100 dark:border-pink-900/30">
          <p className="text-xs text-pink-700 dark:text-pink-400 font-bold text-center leading-relaxed italic">
            Aceste setări sunt salvate în cloud și se aplică pentru toți membrii acestui grup. Restul membrilor vor primi notificările conform acestor reguli.
          </p>
        </div>
      </div>
    </div>
  );
}