import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Compass, Trash2, MapPin, Calendar, Search, ArrowLeft, Filter, Loader2, Users, Edit2, X, Check } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { toast } from "sonner";

// IMPORTURI FIREBASE REALE
import { db, auth } from "../../firebase";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
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
  status?: "planning" | "voting" | "confirmed"; // Câmp adăugat/opțional pentru control admin
  itinerary?: any[];
}

export function AdminTrips() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  
  // Stări pentru editare inline (Modal)
  const [tripToEdit, setTripToEdit] = useState<Trip | null>(null);
  const [editName, setEditName] = useState("");
  const [editDestination, setEditDestination] = useState("");
  const [editStatus, setEditStatus] = useState("planning");
  const [isSaving, setIsSaving] = useState(false);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user || localStorage.getItem('isAdminLoggedIn') !== 'true') {
        navigate("/");
        return;
      }

      const unsubscribeTrips = onSnapshot(collection(db, "trips"), (snapshot) => {
        const tripsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Trip[];
        
        setTrips(tripsData);
        setLoading(false);
      }, (error) => {
        console.error("Eroare snapshot călătorii:", error);
        setLoading(false);
      });

      return () => unsubscribeTrips();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // Deschide fereastra de editare cu datele călătoriei selectate
  const handleOpenEdit = (trip: Trip) => {
    setTripToEdit(trip);
    setEditName(trip.name || "");
    setEditDestination(trip.destination || "");
    setEditStatus(trip.status || calculateTripStatus(trip));
  };

  // Salvează modificările în Firestore global
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripToEdit) return;

    setIsSaving(true);
    try {
      const tripDocRef = doc(db, "trips", tripToEdit.id);
      await updateDoc(tripDocRef, {
        name: editName.trim(),
        destination: editDestination.trim(),
        status: editStatus
      });
      toast.success("Călătoria a fost actualizată în baza de date!");
      setTripToEdit(null); // Închidem modalul
    } catch (error) {
      console.error("Eroare la salvare:", error);
      toast.error("Nu s-au putut salva modificările călătoriei.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (tripToDelete) {
      try {
        await deleteDoc(doc(db, "trips", tripToDelete));
        toast.success("Călătoria a fost eliminată definitiv din sistem.");
      } catch (error) {
        toast.error("Eroare la ștergerea călătoriei.");
      } finally {
        setTripToDelete(null);
      }
    }
  };

  // Funcții ajutătoare native
  const getDisplayImage = (trip: Trip) => {
    const cityName = (trip.destination || 'travel').split(',')[0].trim();
    const isBroken = !trip.image || trip.image === "" || trip.image.includes("picsum.photos");

    if (isBroken) {
      return `https://tse1.mm.bing.net/th?q=${encodeURIComponent(cityName + " city travel landscape")}&w=600&h=400&c=1&p=0`;
    }
    return trip.image;
  };

  const calculateTripStatus = (trip: Trip): "planning" | "voting" | "confirmed" => {
    if (trip.status) return trip.status; // Dacă adminul a forțat un status manual, îl respectăm
    const itinerary = trip.itinerary || [];
    const hasActivities = itinerary.some((day: any) => day.activities && day.activities.length > 0);
    if (hasActivities) return "voting";
    return "planning";
  };

  const formatTripDates = (start: string, end: string) => {
    if (!start || !end) return "Data nespecificată";
    const s = new Date(start);
    const e = new Date(end);
    const months = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${s.getDate()} ${months[s.getMonth()]} - ${e.getDate()} ${months[e.getMonth()]}`;
  };

  const getStatusBadgeStyle = (trip: Trip) => {
    const status = calculateTripStatus(trip);
    switch (status) {
      case "confirmed": return "bg-green-600/20 text-green-600 border-green-200";
      case "voting": return "bg-purple-600/20 text-purple-600 border-purple-200";
      default: return "bg-blue-600/20 text-blue-600 border-blue-200";
    }
  };

  const filteredTrips = trips.filter(trip => 
    (trip.destination?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (trip.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-300 min-h-screen pb-24">
      <div className="w-full flex flex-col max-w-md mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/admin-dashboard")}
            className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              Călătorii ({trips.length})
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Activitate Globală</p>
          </div>
        </div>

        {/* Căutare */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Caută destinație..."
              className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-gray-400 shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Listă Călătorii */}
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Se încarcă...
            </div>
          ) : (
            filteredTrips.map(trip => (
              <div 
                key={trip.id} 
                onClick={() => handleOpenEdit(trip)}
                className="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:scale-[1.01] hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group"
              >
                <div className="flex p-4 gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <ImageWithFallback src={getDisplayImage(trip)} alt={trip.destination} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white leading-tight truncate">{trip.destination}</h3>
                        <div className="text-[10px] text-gray-400 italic truncate mt-0.5">{trip.name}</div>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${getStatusBadgeStyle(trip)}`}>
                        {calculateTripStatus(trip)}
                      </span>
                    </div>

                    <div className="flex justify-between items-end" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold">
                          <Calendar className="w-3 h-3 text-purple-500" /> {formatTripDates(trip.startDate, trip.endDate)}
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-gray-400 font-medium">
                          <Users className="w-3 h-3 text-green-500" /> {trip.participants?.length || 0} membri
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-0.5">
                        <button 
                          onClick={() => handleOpenEdit(trip)}
                          className="p-2 text-gray-400 hover:text-blue-500 dark:hover:bg-gray-800 rounded-xl transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setTripToDelete(trip.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL MODIFICARE CĂLĂTORIE */}
      {tripToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form 
            onSubmit={handleSaveChanges}
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Editează Călătoria</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Modificare detalii administrative</p>
              </div>
              <button 
                type="button"
                onClick={() => setTripToEdit(null)}
                className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Destinație */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Oraș / Destinație</label>
              <input 
                type="text" 
                value={editDestination}
                onChange={(e) => setEditDestination(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Nume Grup */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Numele Grupului (Titlu)</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Status Călătorie */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Stadiu / Status Călătorie</label>
              <select 
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="planning">Planificare (Fără activități)</option>
                <option value="voting">Votare (Activități în desfășurare)</option>
                <option value="confirmed">Confirmat (Traseu stabilit)</option>
              </select>
            </div>

            {/* Date Info - Citire Doar */}
            <div className="space-y-1.5 opacity-60">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Perioada Călătoriei (Inalterabilă local)</label>
              <div className="w-full bg-gray-100 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl py-3.5 px-4 text-sm text-gray-500 font-medium">
                {formatTripDates(tripToEdit.startDate, tripToEdit.endDate)} ({tripToEdit.participants?.length || 0} participanți)
              </div>
            </div>

            {/* Acțiuni */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setTripToEdit(null)}
                className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black uppercase text-xs tracking-widest rounded-2xl transition-all"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3.5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {isSaving ? "Se salvează..." : <><Check className="w-4 h-4" /> Salvează</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={tripToDelete !== null}
        title="Șterge Călătoria"
        message="Confirmi eliminarea definitivă a acestei aventuri din sistem? Toți membrii grupului vor pierde accesul la ea."
        onConfirm={confirmDelete}
        onCancel={() => setTripToDelete(null)}
        confirmText="Șterge"
        cancelText="Anulează"
      />
    </div>
  );
}