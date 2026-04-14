import { useNavigate, useParams } from "react-router";
import { 
  ChevronLeft, 
  Users, 
  Map, 
  Bell, 
  Lock, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  UserPlus,
  EyeOff,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { doc, onSnapshot, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function TripSettings() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Verificăm dacă user-ul curent este admin (owner)
  const isAdmin = auth.currentUser?.uid === trip?.ownerId;

  // 1. PROTECȚIE AUTH + ASCULTARE DATE ÎN TIMP REAL
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => { 
      if (!user) navigate("/"); 
    });

    if (!id) return;

    const tripRef = doc(db, "trips", id);
    const unsubscribe = onSnapshot(tripRef, (snap) => {
      if (snap.exists()) {
        setTrip({ id: snap.id, ...snap.data() });
      } else {
        // Dacă documentul nu mai există și nu suntem în proces de ștergere, mergem la home
        if (!isDeleteModalOpen) {
          navigate("/");
        }
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubscribe();
    };
  }, [id, navigate, isDeleteModalOpen]);

  // 2. LOGICA DE ȘTERGERE
  const confirmDelete = async () => {
    if (!id || !isAdmin) return;

    try {
      await deleteDoc(doc(db, "trips", id));
      toast.error(`Călătoria "${trip?.name}" a fost ștearsă definitiv.`);
      setIsDeleteModalOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Nu s-a putut șterge călătoria.");
    }
  };

  // COMPONENTĂ INTERNĂ PENTRU RÂNDURILE DE SETĂRI
  const SettingItem = ({ icon: Icon, title, subtitle, onClick, color = "text-gray-600" }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 bg-white dark:bg-gray-900 active:bg-gray-50 dark:active:bg-gray-800 transition-all border-b border-gray-100 dark:border-gray-800 last:border-0 group"
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 ${color} transition-transform group-hover:scale-110`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left">
          <p className="text-[14px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{title}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{subtitle}</p>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 transition-transform group-hover:translate-x-1" />
    </button>
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 min-h-screen">
      {/* Header Sticky identic cu aplicația */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 py-4 flex items-center border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
        <button 
          onClick={() => navigate(-1)} 
          className="p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5 text-gray-900 dark:text-white" />
        </button>
        <div className="ml-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-none tracking-tighter">Setări Călătorie</h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 uppercase tracking-widest">{trip?.name}</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-6 space-y-8 py-10">
        {/* Secțiunea: Grup & Membri */}
        <div>
          <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-2">Grup & Membri</h2>
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">
            <SettingItem 
              icon={Users} 
              title="Gestionează Membri" 
              subtitle="Vezi cine face parte din grup"
              onClick={() => navigate(`/manage-members/${id}`)}
              color="text-blue-600 dark:text-blue-400"
            />
            {isAdmin && (
              <SettingItem 
                icon={UserPlus} 
                title="Permisiuni Invitație" 
                subtitle="Setează cine poate adăuga persoane"
                onClick={() => navigate(`/invitation-permissions/${id}`)}
                color="text-purple-600 dark:text-purple-400"
              />
            )}
          </div>
        </div>

        {/* Secțiunea: Planificare */}
        <div>
          <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-2">Planificare</h2>
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">
            <SettingItem icon={Map} title="Modifică Destinația" subtitle="Schimbă locația călătoriei" onClick={() => navigate(`/change-destination/${id}`)} color="text-orange-600 dark:text-orange-400" />
            
            {isAdmin && (
              <>
                <SettingItem icon={ShieldCheck} title="Confidențialitate" subtitle="Setări vizibilitate profil" onClick={() => navigate(`/privacy-settings/${id}`)} color="text-green-600 dark:text-green-400" />
                <SettingItem icon={EyeOff} title="Ascunde Itinerariul" subtitle="Mod surpriză pentru grup" onClick={() => navigate(`/hide-itinerary/${id}`)} color="text-indigo-600 dark:text-indigo-400" />
              </>
            )}
          </div>
        </div>

        {/* Secțiunea: Alerte & Blocare */}
        <div>
          <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-3 ml-2">Alerte & Securitate</h2>
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">
            <SettingItem icon={Bell} title="Alerte Voturi" subtitle="Notificări pentru noi activități" onClick={() => navigate(`/vote-notifications/${id}`)} color="text-pink-600 dark:text-pink-400" />
            
            {isAdmin && (
              <SettingItem icon={Lock} title="Blochează Itinerariul" subtitle="Oprește editările membrilor" onClick={() => navigate(`/lock-itinerary/${id}`)} color="text-red-500" />
            )}
          </div>
        </div>

        {/* Buton Ștergere - Doar Admin */}
        {isAdmin && (
          <button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 p-6 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-500 font-black text-xs uppercase tracking-[0.2em] rounded-[2.5rem] active:scale-[0.98] transition-all border border-red-100 dark:border-red-900/30 mt-8 shadow-lg shadow-red-500/5"
          >
            <Trash2 className="w-5 h-5" />
            Șterge Călătoria Definitiv
          </button>
        )}
      </div>

      {/* --- MODALUL DE STERGERE PERSONALIZAT --- */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 w-full max-w-sm text-center shadow-2xl border border-gray-100 dark:border-gray-800 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black mb-3 text-gray-900 dark:text-white tracking-tighter uppercase">Ștergi totul?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed font-medium">
              Sigur vrei să ștergi <span className="font-black text-gray-900 dark:text-white">{trip?.name}</span>? Toate datele, pozele și mesajele grupului vor fi eliminate ireversibil.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDelete} 
                className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/20 active:scale-95 transition-all"
              >
                Șterge Acum
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="w-full py-5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                Anulează
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}