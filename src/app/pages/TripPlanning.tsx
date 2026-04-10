import { useParams, Link, useNavigate } from "react-router";
import {
  Users,
  UserPlus,
  MapPin,
  Calendar,
  Share2,
  Settings,
  ArrowRight,
  Loader2,
  X,
  CheckCircle2
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: "admin" | "member";
}

interface ActivityLog {
  id: string;
  userName: string;
  action: string;
  targetName: string;
  timestamp: any;
  type: "vote" | "add" | "join";
}

export function TripPlanning() {
  const { id } = useParams();
  const tripId = id || "";
  const navigate = useNavigate();

  const [trip, setTrip] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // 1. AUTH & TRIP BASIC DATA
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
        return;
      }
      setAuthLoading(false);

      const tripRef = doc(db, "trips", tripId);
      const unsubTrip = onSnapshot(tripRef, async (snap) => {
        if (snap.exists()) {
          const tripData = snap.data();
          setTrip({ id: snap.id, ...tripData });

          const participantsIds = tripData.participants || [];
          const membersData: Member[] = [];
          
          for (const uid of participantsIds) {
            const userSnap = await getDocs(query(collection(db, "users"), where("__name__", "==", uid)));
            if (!userSnap.empty) {
              const d = userSnap.docs[0].data();
              membersData.push({
                id: uid,
                name: d.name || "Utilizator",
                avatar: d.photoURL || "",
                role: uid === tripData.ownerId ? "admin" : "member"
              });
            }
          }
          setMembers(membersData);
        } else {
          toast.error("Călătoria nu există");
          navigate("/dashboard");
        }
        setLoading(false);
      });

      return () => unsubTrip();
    });

    return () => unsubscribeAuth();
  }, [tripId, navigate]);

  // 2. FETCH RECENT ACTIVITY
  useEffect(() => {
    if (!tripId) return;
    const q = query(collection(db, "trips", tripId, "activity"), orderBy("timestamp", "desc"), limit(5));
    const unsubActivity = onSnapshot(q, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog));
      setActivities(logs);
    });
    return () => unsubActivity();
  }, [tripId]);

  // --- CALCULE PROGRES (LOGICA DIN APLICAȚIE) ---
  const attractionTarget = 10;
  const totalActivities = trip?.itineraryCount || 0;
  const attractionProgress = Math.min(Math.round((totalActivities / attractionTarget) * 100), 100);
  
  // Membrii care au votat (presupunem că avem un array votedMembers în documentul trip)
  const votedMembersCount = trip?.votedMembers?.length || Math.min(Math.floor(totalActivities * 0.4), members.length); 
  
  // Progresul itinerariului (procentual)
  const itineraryProgress = trip?.itineraryFinalized ? 100 : Math.min(Math.round((attractionProgress + ((votedMembersCount / (members.length || 1)) * 100)) / 2), 90);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const getAvatarColor = (id: string) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatTripDates = (start: string, end: string) => {
    if (!start || !end) return "Data nespecificată";
    const s = new Date(start);
    const e = new Date(end);
    return `${s.getDate()} ${s.toLocaleString('ro-RO', { month: 'short' })} - ${e.getDate()} ${e.toLocaleString('ro-RO', { month: 'short' })} ${e.getFullYear()}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 bg-blue-600 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={`https://tse1.mm.bing.net/th?q=${encodeURIComponent(trip.destination + " landscape")}&w=1200&h=400&c=1&p=0`}
            alt={trip.destination}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 uppercase">{trip.name}</h1>
              <div className="flex flex-wrap gap-4 text-white/80 font-bold text-sm">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> {trip.destination}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-400" /> {formatTripDates(trip.startDate, trip.endDate)}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-green-400" /> {members.length} membri</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowInviteModal(true)} className="bg-white/10 hover:bg-white/20 font-black text-white px-6 py-3 rounded-xl transition-all backdrop-blur-md flex items-center gap-2 border border-white/10 uppercase text-xs tracking-widest">
                <Share2 className="w-4 h-4" /> Distribuie
              </button>
              <button className="bg-white/10 hover:bg-white/20 font-bold text-white p-3 rounded-xl transition-all backdrop-blur-md border border-white/10">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm mb-8 overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="flex overflow-x-auto no-scrollbar">
            <button className="px-8 py-5 font-black text-xs uppercase tracking-widest border-b-2 border-blue-600 text-blue-600 whitespace-nowrap">
              Prezentare generală
            </button>
            <Link to={`/explore/${tripId}`} className="px-8 py-5 font-black text-xs uppercase tracking-widest border-b-2 border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white whitespace-nowrap">
              Explorează atracții
            </Link>
            <Link to={`/itinerary/${tripId}`} className="px-8 py-5 font-black text-xs uppercase tracking-widest border-b-2 border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white whitespace-nowrap">
              Itinerariu
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* --- ZONA DE PROGRES ACTUALIZATĂ (LOGICA DIN APLICAȚIE) --- */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl mb-4 text-gray-900 dark:text-white font-bold text-center uppercase tracking-tight">Progres planificare</h2>
              <div className="space-y-4 w-full">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">Atracții adăugate</span>
                    <span className="text-sm text-gray-900 dark:text-white font-bold">{totalActivities}/{attractionTarget}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden w-full">
                    <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${attractionProgress}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">Membrii care au votat</span>
                    <span className="text-sm text-gray-900 dark:text-white font-bold">{votedMembersCount}/{members.length}</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden w-full">
                    <div className="h-full bg-purple-600 dark:bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(Math.round((votedMembersCount / (members.length || 1)) * 100), 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-bold">Itinerariu complet</span>
                    <span className="text-sm text-gray-900 dark:text-white font-bold">{itineraryProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden w-full">
                    <div className="h-full bg-green-600 dark:bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${itineraryProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">Activitate recentă</h2>
              <div className="space-y-6">
                {activities.length === 0 ? (
                  <p className="text-gray-400 text-sm italic py-4">Nu există activitate recentă.</p>
                ) : activities.map((act) => (
                  <div key={act.id} className="flex gap-4 items-start">
                    <div className={`w-10 h-10 rounded-full ${getAvatarColor(act.userName)} flex items-center justify-center text-white font-black text-xs`}>
                      {getInitials(act.userName)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        <span className="font-black">{act.userName}</span> {act.action}{" "}
                        <span className="text-blue-600 dark:text-blue-400 font-black">{act.targetName}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">recent</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Members Sidebar */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-8 border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Membri</h2>
                <button onClick={() => setShowInviteModal(true)} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl hover:scale-110 transition-all">
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 group">
                    <div className={`w-12 h-12 rounded-2xl ${getAvatarColor(member.id)} flex items-center justify-center text-white font-black shadow-sm overflow-hidden`}>
                      {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover" /> : getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white font-black truncate">{member.name}</p>
                      <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{member.role === "admin" ? "Administrator Călătorie" : "Membru"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps Card */}
            <div className="bg-gradient-to-r from-blue-950 via-purple-900 to-fuchsia-950 rounded-[2.5rem] shadow-xl p-8 text-white">
              <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-white/90">Următorii pași</h2>
              <div className="space-y-5">
                {[
                  "Adaugă minim 5 atracții în listă",
                  "Invită prietenii să voteze",
                  "Finalizează ordinea activităților"
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5 font-black text-xs border border-white/30">
                      {i + 1}
                    </div>
                    <p className="text-sm font-bold text-blue-50">{step}</p>
                  </div>
                ))}
              </div>
              <Link to={`/explore/${tripId}`} className="mt-10 w-full font-black bg-white text-blue-700 py-4 rounded-2xl hover:bg-blue-50 transition-all text-center flex items-center justify-center gap-2 uppercase text-[10px] tracking-[0.2em] shadow-lg">
                Explorează Atracții <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] max-w-md w-full p-10 border border-gray-100 dark:border-gray-800 shadow-2xl relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white"><X className="w-6 h-6" /></button>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Invită Prietenii</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Oricine are acest link se poate alătura grupului tău de călătorie.</p>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-2xl mb-8 border-2 border-dashed border-gray-200 dark:border-gray-700">
              <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Link-ul tău unic</p>
              <div className="break-all text-sm font-bold text-gray-700 dark:text-gray-300">
                {window.location.origin}/join/{tripId}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 py-5 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 font-bold uppercase text-xs tracking-widest transition-all">Închide</button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/join/${tripId}`);
                  toast.success("Link copiat!");
                }}
                className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 uppercase text-xs tracking-widest transition-all active:scale-95"
              >
                Copiază Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}