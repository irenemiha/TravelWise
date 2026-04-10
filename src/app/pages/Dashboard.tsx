import { Link, useNavigate } from "react-router";
import { Plus, Users, Calendar, MapPin, TrendingUp, Loader2, X } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  participants: string[];
  ownerId: string;
  image?: string;
  votesCount?: number;
  itineraryCount?: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  
  // State pentru form-ul de călătorie nouă
  const [newTrip, setNewTrip] = useState({
    name: "",
    destination: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // 1. ASCULTĂM CĂLĂTORIILE ÎN TIMP REAL
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/");
        return;
      }

      const q = query(
        collection(db, "trips"),
        where("participants", "array-contains", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubscribeTrips = onSnapshot(q, (snapshot) => {
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Trip[];
        setTrips(tripsData);
        setLoading(false);
      }, (error) => {
        console.error("Firestore error:", error);
        setLoading(false);
      });

      return () => unsubscribeTrips();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // 2. LOGICĂ CREARE CĂLĂTORIE
  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.name || !newTrip.destination || !auth.currentUser) {
      toast.error("Completează toate câmpurile!");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "trips"), {
        name: newTrip.name,
        destination: newTrip.destination,
        startDate: newTrip.startDate,
        endDate: newTrip.endDate,
        ownerId: auth.currentUser.uid,
        participants: [auth.currentUser.uid],
        createdAt: serverTimestamp(),
        image: "" // Se va genera automat via Bing în UI
      });

      toast.success("Călătoria a fost creată!");
      setShowNewTripModal(false);
      navigate(`/trip/${docRef.id}`);
    } catch (error) {
      toast.error("Eroare la crearea călătoriei.");
    }
  };

  // 3. HELPER IMAGINE BING (Consistență cu restul site-ului)
  const getTripImage = (trip: Trip) => {
    if (trip.image && trip.image !== "") return trip.image;
    const city = trip.destination.split(',')[0].trim();
    return `https://tse1.mm.bing.net/th?q=${encodeURIComponent(city + " travel destination")}&w=800&h=450&c=1&p=0`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
              Călătoriile mele
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gestionează și planifică toate aventurile tale în timp real
            </p>
          </div>
          <button
            onClick={() => setShowNewTripModal(true)}
            className="inline-flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-700 active:scale-95 transition-all gap-2 shadow-xl shadow-blue-500/20"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            Călătorie nouă
          </button>
        </div>

        {/* Real-time Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: "Călătorii", value: trips.length, icon: Calendar, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Membri", value: trips.reduce((acc, t) => acc + (t.participants?.length || 0), 0), icon: Users, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
            { label: "Locații", value: Array.from(new Set(trips.map(t => t.destination))).length, icon: MapPin, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
            { label: "Voturi", value: trips.reduce((acc, t) => acc + (t.votesCount || 0), 0), icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</div>
              </div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              to={`/trip/${trip.id}`}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-2xl hover:-translate-y-1 group"
            >
              <div className="relative h-56 overflow-hidden flex">
                <ImageWithFallback
                  src={getTripImage(trip)}
                  alt={trip.destination}
                  className="w-full h-full min-w-full min-h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 transition-colors tracking-tight">
                  {trip.name}
                </h3>
                <div className="space-y-3 text-sm font-bold text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    {trip.destination}
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    {new Date(trip.startDate).toLocaleDateString('ro-RO')} - {new Date(trip.endDate).toLocaleDateString('ro-RO')}
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-500" />
                    {trip.participants.length} membri în grup
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                   <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Activități</span>
                      <span className="text-lg font-black dark:text-white">{trip.itineraryCount || 0}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Voturi active</span>
                      <span className="text-lg font-black text-blue-600">{trip.votesCount || 0}</span>
                   </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {trips.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-16 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 transition-all">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Nicio călătorie încă</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 font-medium">Începe să planifici prima ta aventură colaborativă cu prietenii tăi!</p>
              <button
                onClick={() => setShowNewTripModal(true)}
                className="bg-blue-600 text-white font-black uppercase text-xs tracking-widest px-10 py-5 rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                Creează prima călătorie
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Trip Modal */}
      {showNewTripModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] max-w-md w-full p-10 border border-gray-100 dark:border-gray-800 shadow-2xl relative">
            <button onClick={() => setShowNewTripModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Călătorie nouă</h2>
            
            <form onSubmit={handleCreateTrip} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-2">Numele aventurii</label>
                <input
                  type="text"
                  required
                  value={newTrip.name}
                  onChange={(e) => setNewTrip({...newTrip, name: e.target.value})}
                  placeholder="ex: Barcelona Summer"
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white font-bold transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-2">Destinația</label>
                <input
                  type="text"
                  required
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({...newTrip, destination: e.target.value})}
                  placeholder="ex: Barcelona, Spania"
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white font-bold transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-2">Start</label>
                    <input
                      type="date"
                      value={newTrip.startDate}
                      onChange={(e) => setNewTrip({...newTrip, startDate: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl dark:text-white font-bold text-sm"
                    />
                 </div>
                 <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-2">Final</label>
                    <input
                      type="date"
                      value={newTrip.endDate}
                      onChange={(e) => setNewTrip({...newTrip, endDate: e.target.value})}
                      className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl dark:text-white font-bold text-sm"
                    />
                 </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button
                  type="button"
                  onClick={() => setShowNewTripModal(false)}
                  className="flex-1 py-5 border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 font-bold uppercase text-xs tracking-widest transition-all"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-500/20 uppercase text-xs tracking-widest transition-all active:scale-95"
                >
                  Creează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}