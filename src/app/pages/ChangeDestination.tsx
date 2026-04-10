import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Search, MapPin, Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function ChangeDestination() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [newDestination, setNewDestination] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
      else setAuthLoading(false);
    });
    return () => unsub();
  }, [navigate]);

  const handleSave = async () => {
    if (!newDestination.trim() || !id) return;
    setIsSaving(true);
    try {
      const cityOnly = newDestination.split(",")[0].trim();
      const newImageUrl = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(cityOnly + " landscape")}&w=1200&h=800&c=1&p=0`;
      await updateDoc(doc(db, "trips", id), {
        destination: newDestination,
        image: newImageUrl
      });
      toast.success("Destinație actualizată!");
      navigate(-1);
    } catch (error) {
      toast.error("Eroare la salvare.");
    } finally { setIsSaving(false); }
  };

  if (authLoading) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 transition-colors font-bold uppercase text-[10px] tracking-widest">
          <ChevronLeft className="w-4 h-4" /> Înapoi
        </button>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Schimbă Destinația</h1>
              <p className="text-sm text-gray-500">Unde vrei să muți aventura?</p>
            </div>
          </div>

          <div className="relative mb-10">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" value={newDestination} onChange={(e) => setNewDestination(e.target.value)}
              placeholder="Ex: Barcelona, Spania" 
              className="w-full p-5 pl-14 rounded-2xl border-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 font-bold transition-all"
            />
          </div>

          <div className="space-y-4 mb-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Sugestii Populare</p>
            <div className="grid grid-cols-2 gap-3">
              {["Londra", "Barcelona", "Tokyo", "Paris"].map((city) => (
                <button 
                  key={city} onClick={() => setNewDestination(city)}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    newDestination === city ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <MapPin className={`w-4 h-4 ${newDestination === city ? "text-white" : "text-blue-600"}`} />
                  <span className="font-bold text-sm">{city}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSave} disabled={isSaving || !newDestination.trim()}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Actualizează Destinația"}
          </button>
        </div>
      </div>
    </div>
  );
}