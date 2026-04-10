import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Users, Map, Bell, Lock, Trash2, ChevronRight, ShieldCheck, UserPlus, EyeOff, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { ConfirmDialog } from "../components/ConfirmDialog";

export function TripSettings() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDel, setShowDel] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => { if (!user) navigate("/"); });
    if (!id) return;
    const unsub = onSnapshot(doc(db, "trips", id), (snap) => {
      if (snap.exists()) setTrip(snap.data());
      setLoading(false);
    });
    return () => unsub();
  }, [id, navigate]);

  const isAdmin = auth.currentUser?.uid === trip?.ownerId;

  if (loading) return null;

  const NavItem = ({ icon: Icon, title, desc, to, color }: any) => (
    <button onClick={() => navigate(to)} className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border-b dark:border-gray-800 last:border-0 group">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 shadow-sm transition-transform group-hover:scale-110`}><Icon className={color} /></div>
        <div className="text-left">
          <p className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">{title}</p>
          <p className="text-xs text-gray-400 font-bold">{desc}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300" />
    </button>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6 transition-colors">
      <div className="max-w-2xl mx-auto py-12">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-md"><ChevronLeft/></button>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Setări Trip</h1>
        </div>

        <div className="space-y-8">
          <section>
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-4">Administrare Grup</h2>
             <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
                <NavItem icon={Users} title="Membri" desc="Gestionează cine are acces." to={`/manage-members/${id}`} color="text-blue-600" />
                {isAdmin && <NavItem icon={UserPlus} title="Permisiuni" desc="Cine poate invita prieteni." to={`/invitation-permissions/${id}`} color="text-purple-600" />}
             </div>
          </section>

          <section>
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-4">Configurare Plan</h2>
             <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all">
                <NavItem icon={Map} title="Destinație" desc="Schimbă orașul călătoriei." to={`/change-destination/${id}`} color="text-orange-600" />
                {isAdmin && <NavItem icon={EyeOff} title="Vizibilitate" desc="Ascunde itinerariul (Surpriză)." to={`/hide-itinerary/${id}`} color="text-indigo-600" />}
                {isAdmin && <NavItem icon={Lock} title="Blocare" desc="Oprește editarea planului." to={`/lock-itinerary/${id}`} color="text-red-500" />}
             </div>
          </section>

          {isAdmin && (
            <button onClick={() => setShowDel(true)} className="w-full p-6 bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-red-600 font-black uppercase text-xs tracking-widest hover:bg-red-100 transition-all border border-red-100 dark:border-red-900/30">
              <Trash2 className="w-5 h-5" /> Șterge Călătoria Definitiv
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog isOpen={showDel} title="Ștergi totul?" message="Această acțiune nu poate fi anulată." onConfirm={async () => { await deleteDoc(doc(db, "trips", id!)); navigate("/"); }} onCancel={() => setShowDel(false)} />
    </div>
  );
}