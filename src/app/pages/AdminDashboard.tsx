import { Link, useNavigate } from "react-router";
import { 
  Users, Calendar, MapPin, TrendingUp, 
  ShieldAlert, Trash2, UserCheck, LogOut, Loader2 
} from "lucide-react";
import { useState, useEffect } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "sonner";

// IMPORTURI FIREBASE REALE
import { db, auth } from "../../firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  getDocs 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  image: string;
  participants: string[];
  ownerId: string;
  itinerary?: any[];
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'trip' | 'user' } | null>(null);
  const [globalVotesTotal, setGlobalVotesTotal] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      // Verificăm dacă sesiunea de admin locală este activă
      // if (!user || localStorage.getItem('isAdminLoggedIn') !== 'true') {
      //   navigate("/");
      //   return;
      // }
      setAuthLoading(false);

      // 1. Ascultăm în timp real TOATE călătoriile (fără filtru de participant)
      const unsubscribeTrips = onSnapshot(collection(db, "trips"), async (snapshot) => {
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Trip[];
        
        setTrips(tripsData);

        // Calculăm voturile globale din sub-colecțiile fiecărei călătorii
        let totalVotesFound = 0;
        for (const trip of tripsData) {
          try {
            const votesRef = collection(db, "trips", trip.id, "attractionVotes");
            const votesSnap = await getDocs(votesRef);
            votesSnap.docs.forEach(vDoc => {
              const vData = vDoc.data();
              if (vData.voters) {
                totalVotesFound += Object.keys(vData.voters).length;
              }
            });
          } catch (err) {
            console.error("Error counting global votes:", err);
          }
        }
        setGlobalVotesTotal(totalVotesFound);
      });

      // 2. Ascultăm în timp real TOȚI utilizatorii înregistrați
      const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[];
        
        setUsers(usersData);
        setLoading(false);
      });

      return () => {
        unsubscribeTrips();
        unsubscribeUsers();
      };
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate("/");
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'trip') {
        await deleteDoc(doc(db, "trips", itemToDelete.id));
        toast.success("Călătoria a fost ștearsă global din sistem.");
      } else {
        await deleteDoc(doc(db, "users", itemToDelete.id));
        toast.success("Contul utilizatorului a fost eliminat.");
      }
    } catch (error) {
      toast.error("Eroare la eliminarea elementului.");
    } finally {
      setItemToDelete(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-300 min-h-screen pb-24">
      <div className="w-full flex flex-col max-w-md mx-auto">
        
        {/* Header Admin */}
        <div className="w-full flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4 shadow-xl shadow-red-500/10">
            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            Panou Control Admin
          </h1>
          <button 
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 text-xs font-black text-gray-400 hover:text-red-500 tracking-widest uppercase transition-colors"
          >
            <LogOut className="w-4 h-4" /> Deconectare
          </button>
        </div>

        {/* Stats Grid - Date Reale Globale */}
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          {[
            { label: "Total Călătorii", value: trips.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", path: "/admin-trips" },
            { label: "Utilizatori", value: users.length, icon: Users, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", path: "/admin-users" },
            { label: "Destinații", value: [...new Set(trips.map(t => t.destination))].length, icon: MapPin, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20", path: null },
            { label: "Voturi Sistem", value: globalVotesTotal, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", path: null },
          ].map((stat, idx) => {
            // Clasale comune pentru design, plus efectele de hover doar dacă există un drum (path) definit
            const cardStyles = `bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col items-center shadow-sm select-none transition-all duration-200 ${
              stat.path 
                ? 'hover:scale-[1.03] hover:shadow-md cursor-pointer active:scale-95' 
                : ''
            }`;

            const cardContent = (
              <>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} mb-3`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</div>
              </>
            );

            // Dacă avem setată o rută, învelim cardul într-un <Link>, altfel returnăm un simplu <div>
            return stat.path ? (
              <Link key={idx} to={stat.path} className={cardStyles}>
                {cardContent}
              </Link>
            ) : (
              <div key={idx} className={cardStyles}>
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Section: Management Utilizatori (Previzualizare rapida din DB) */}
        <div className="w-full mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Utilizatori Sistem ({users.length})
            </h2>
            <Link 
              to="/admin-users" 
              className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl transition-all"
            >
              Vezi tot {'>'}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {users.slice(0, 3).map(user => (
              <div key={user.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name || "Utilizator Nou"}</div>
                  <div className="text-[10px] text-gray-500 font-medium">{user.email}</div>
                </div>
                <button 
                  onClick={() => setItemToDelete({ id: user.id, type: 'user' })}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Monitorizare Călătorii (Previzualizare rapida din DB) */}
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Monitorizare Călătorii ({trips.length})</h2>
            <Link 
              to="/admin-trips" 
              className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-950/40 px-3 py-1.5 rounded-xl transition-all"
            >
              Vezi tot {'>'}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {trips.slice(0, 3).map(trip => (
              <div key={trip.id} className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 shadow-sm">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <img 
                    src={trip.image || `https://tse1.mm.bing.net/th?q=${encodeURIComponent((trip.destination || 'city').split(',')[0])}&w=150&h=150&c=1`} 
                    alt="" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{trip.destination}</div>
                  <div className="text-[10px] text-gray-500 italic truncate">{trip.name}</div>
                </div>
                <button 
                  onClick={() => setItemToDelete({ id: trip.id, type: 'trip' })}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      <ConfirmDialog
        isOpen={itemToDelete !== null}
        title={itemToDelete?.type === 'user' ? "Șterge Utilizator" : "Șterge Călătorie"}
        message={itemToDelete?.type === 'user' ? "Ești sigur că vrei să elimini acest cont definitiv?" : "Această acțiune va șterge călătoria din conturile tuturor participanților!"}
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
        confirmText="Confirmă"
        cancelText="Anulează"
      />
    </div>
  );
}