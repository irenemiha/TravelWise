import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Loader2, BellRing, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function VoteNotifications() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [settings, setSettings] = useState<any>({ everyVote: true, summary: false, chatAlerts: true });
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => { if (!user) navigate("/"); else setAuthLoading(false); });
    if (!id) return;
    const unsub = onSnapshot(doc(db, "trips", id), (snap) => {
      if (snap.exists() && snap.data().voteSettings) setSettings(snap.data().voteSettings);
      setLoading(false);
    });
    return () => unsub();
  }, [id, navigate]);

  const toggle = async (key: string) => {
    const newS = { ...settings, [key]: !settings[key] };
    await updateDoc(doc(db, "trips", id!), { voteSettings: newS });
    toast.success("Setări actualizate!");
  };

  if (authLoading || loading) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6 transition-colors">
      <div className="max-w-2xl mx-auto py-12">
        <button onClick={() => navigate(-1)} className="mb-8 text-gray-400 hover:text-blue-600 font-black uppercase text-[10px] tracking-widest flex items-center gap-2"><ChevronLeft/> Înapoi</button>
        
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
           <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-600 mb-6"><BellRing className="w-8 h-8"/></div>
           <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Alerte Voturi</h1>
           <p className="text-gray-500 dark:text-gray-400 font-medium mb-10">Configurează cum dorești să fii notificat când membrii grupului interacționează.</p>

           <div className="space-y-4">
              {[
                { id: 'everyVote', title: 'Fiecare vot nou', desc: 'Notificare instantanee.', icon: BellRing },
                { id: 'chatAlerts', title: 'Alerte în Chat', desc: 'Mesaje automate în chat.', icon: MessageCircle }
              ].map((opt) => (
                <button 
                  key={opt.id} onClick={() => toggle(opt.id)}
                  className="w-full p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl flex items-center justify-between border border-gray-100 dark:border-gray-700 group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <opt.icon className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                       <p className="font-black text-gray-900 dark:text-white uppercase text-[11px] tracking-widest">{opt.title}</p>
                       <p className="text-xs text-gray-500 font-bold">{opt.desc}</p>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-all relative ${settings[opt.id] ? 'bg-pink-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings[opt.id] ? 'right-1' : 'left-1'}`} />
                  </div>
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}