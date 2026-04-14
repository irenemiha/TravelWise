import { Link, useNavigate } from "react-router";
import { 
  Plus, Users, Calendar, MapPin, TrendingUp, 
  Compass, Trash2, MessageCircle, Loader2 
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
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

export function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  const [realVotesTotal, setRealVotesTotal] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
        return;
      }
      setAuthLoading(false);

      const q = query(
        collection(db, "trips"),
        where("participants", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribeTrips = onSnapshot(q, async (snapshot) => {
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Trip[];
        
        setTrips(tripsData);

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
            console.error("Error counting votes:", err);
          }
        }
        setRealVotesTotal(totalVotesFound);
        setLoading(false);
      });

      return () => unsubscribeTrips();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const getDisplayImage = (trip: Trip) => {
    const cityName = (trip.destination || 'travel').split(',')[0].trim();
    const isBroken = !trip.image || trip.image === "" || trip.image.includes("picsum.photos");

    if (isBroken) {
      return `https://tse1.mm.bing.net/th?q=${encodeURIComponent(cityName + " city travel landscape")}&w=1200&h=800&c=1&p=0`;
    }
    return trip.image;
  };

  const calculateTripStatus = (trip: Trip): "planning" | "voting" | "confirmed" => {
    const itinerary = trip.itinerary || [];
    const hasActivities = itinerary.some((day: any) => day.activities && day.activities.length > 0);
    if (hasActivities) return "voting";
    return "planning";
  };

  const getStatusBadge = (trip: Trip) => {
    const status = calculateTripStatus(trip);
    const baseClass = "flex items-center backdrop-blur-md border border-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em]";
    
    switch (status) {
      case "planning": return <div className={`${baseClass} bg-blue-600/40`}>Planificare</div>;
      case "voting": return <div className={`${baseClass} bg-purple-600/40`}>Votare</div>;
      case "confirmed": return <div className={`${baseClass} bg-green-600/80 shadow-lg`}>Confirmat</div>;
    }
  };

  const formatTripDates = (start: string, end: string) => {
    if (!start || !end) return "Data nespecificată";
    const s = new Date(start);
    const e = new Date(end);
    const months = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${s.getDate()} ${months[s.getMonth()]} - ${e.getDate()} ${months[e.getMonth()]} ${e.getFullYear()}`;
  };

  const confirmDelete = async () => {
    if (tripToDelete) {
      try {
        await deleteDoc(doc(db, "trips", tripToDelete));
        toast.success("Călătoria a fost ștearsă.");
        setTripToDelete(null);
      } catch (error) {
        toast.error("Eroare la ștergere.");
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER SECTION REPARAT (ALINIERE PERFECTĂ PE CENTRU) --- */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 w-full">
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-500/20 shrink-0">
                <Compass className="w-8 h-8 text-white" />
              </div>
              {/* leading-none elimină padding-ul fontului pentru aliniere la linie */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tighter leading-none">
                Călătoriile mele
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Gestionează aventurile tale și descoperă noi destinații
            </p>
          </div>

          <Link
            to="/new-trip"
            className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl hover:bg-blue-700 active:scale-95 transition-all gap-3 shadow-2xl shadow-blue-500/30 whitespace-nowrap"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            Călătorie nouă
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Călătorii", value: trips.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Membri", value: trips.reduce((acc, t) => acc + (t.participants?.length || 0), 0), icon: Users, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
            { label: "Locații", value: Array.from(new Set(trips.map(t => t.destination))).length, icon: MapPin, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "Voturi", value: realVotesTotal, icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md flex flex-col items-center text-center">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} mb-4`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">{stat.label}</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="group bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl flex flex-col"
            >
              <Link to={`/trip/${trip.id}`} className="relative h-60 overflow-hidden flex">
                <ImageWithFallback
                  src={getDisplayImage(trip)}
                  alt={trip.destination}
                  className="w-full h-full min-w-full min-h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-5 left-5">{getStatusBadge(trip)}</div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              <div className="p-8 flex-1">
                <Link to={`/trip/${trip.id}`}>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors tracking-tight">
                    {trip.name}
                  </h3>
                </Link>
                <div className="space-y-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    {trip.destination}
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    {formatTripDates(trip.startDate, trip.endDate)}
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-500" />
                    {trip.participants.length} membri în grup
                  </div>
                </div>
              </div>

              <div className="flex border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <Link 
                  to={`/trip-chat/${trip.id}`} 
                  className="flex-1 py-5 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" /> 
                  Chat
                </Link>
                <div className="w-[1px] bg-gray-100 dark:bg-gray-800" />
                <button 
                  onClick={(e) => { e.preventDefault(); setTripToDelete(trip.id); }} 
                  className="flex-1 py-5 flex items-center justify-center gap-2 text-red-500 dark:text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <Trash2 className="w-5 h-5" /> 
                  Șterge
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100 dark:border-gray-800">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Nicio aventură încă</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Începe să planifici prima ta călătorie colaborativă!</p>
            <Link
              to="/new-trip"
              className="bg-blue-600 text-white font-black uppercase text-xs tracking-widest px-10 py-5 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all"
            >
              Creează prima călătorie
            </Link>
          </div>
        )}
      </div>

      <ConfirmDialog 
        isOpen={tripToDelete !== null} 
        title="Șterge călătoria" 
        message="Ești sigur că vrei să elimini această aventură? Toate datele grupului vor fi pierdute." 
        onConfirm={confirmDelete} 
        onCancel={() => setTripToDelete(null)} 
        confirmText="Șterge" 
        cancelText="Anulează" 
      />
    </div>
  );
}