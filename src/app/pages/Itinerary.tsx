import { useParams, Link } from "react-router";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, DollarSign, Download, Share2, Coffee, Utensils, Camera, Trash2, Edit2, X, ArrowLeft, Map as MapIcon, Loader2 } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { db, auth } from "../../firebase";
import { doc, onSnapshot, collection, query, orderBy, deleteDoc, updateDoc } from "firebase/firestore";

export function Itinerary() {
  const { id } = useParams();
  const tripId = id || "";
  const [trip, setTrip] = useState<any>(null);
  const [itinerary, setItinerary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<any>({ isOpen: false });

  useEffect(() => {
    if (!tripId) return;
    const unsubTrip = onSnapshot(doc(db, "trips", tripId), (snap) => {
      if (snap.exists()) {
        setTrip(snap.data());
        if (auth.currentUser?.uid === snap.data().ownerId) setIsAdmin(true);
      }
    });

    const unsubItin = onSnapshot(query(collection(db, "trips", tripId, "itinerary"), orderBy("time", "asc")), (snap) => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const grouped: any = {};
      all.forEach((act: any) => {
        if (!grouped[act.day]) grouped[act.day] = [];
        grouped[act.day].push(act);
      });
      setItinerary(Object.keys(grouped).map(day => ({ day: parseInt(day), activities: grouped[day] })).sort((a, b) => a.day - b.day));
      setLoading(false);
    });

    return () => { unsubTrip(); unsubItin(); };
  }, [tripId]);

  const openMap = () => {
    const cityName = trip?.destination?.split(',')[0].trim();
    const locs = itinerary.flatMap(d => d.activities.map((a: any) => `${a.location}, ${cityName}`));
    if (locs.length < 2) return toast.error("Prea puține locații.");
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(locs[0])}&destination=${encodeURIComponent(locs[locs.length-1])}&waypoints=${locs.slice(1,-1).join('|')}&travelmode=walking`, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300 pb-24">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6 text-center md:text-left">
           <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">Itinerariu {trip?.destination?.split(',')[0]}</h1>
              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-2">Planul tău de aventură sincronizat</p>
           </div>
           <div className="flex gap-3">
              <button onClick={() => toast.success("Salvat offline!")} className="p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-md text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-all border border-gray-100 dark:border-gray-800"><Download className="w-5 h-5" /></button>
              <button onClick={openMap} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-500/20 flex items-center gap-2 hover:bg-blue-700 transition-all">
                <MapIcon className="w-4 h-4" /> Vezi Ruta
              </button>
           </div>
        </div>

        <div className="space-y-16">
          {itinerary.map((day) => (
            <div key={day.day} className="relative">
              <div className="flex items-center gap-4 mb-8">
                 <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black px-6 py-2 rounded-xl text-xs uppercase tracking-widest shadow-xl">Ziua {day.day}</div>
                 <div className="h-[2px] flex-1 bg-gray-200 dark:bg-gray-800" />
              </div>

              <div className="space-y-6">
                {day.activities.map((act: any) => (
                  <div key={act.id} className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col md:flex-row">
                    <div className="w-full md:w-64 h-48 relative overflow-hidden">
                      <ImageWithFallback src={act.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest text-blue-600">{act.time}</div>
                    </div>
                    <div className="p-8 flex-1 flex flex-col justify-center">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{act.name}</h3>
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm mb-6"><MapPin className="w-4 h-4" /> {act.location}</div>
                      
                      <div className="flex items-center gap-8 pt-6 border-t border-gray-50 dark:border-gray-800">
                         <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest"><Clock className="w-4 h-4 text-purple-500" /> {act.duration}</div>
                         <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest"><DollarSign className="w-4 h-4 text-green-500" /> {act.price}</div>
                         {isAdmin && (
                           <button onClick={() => setDeleteDialog({ isOpen: true, id: act.id })} className="ml-auto p-2 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog isOpen={deleteDialog.isOpen} title="Șterge Activitate" message="Sigur vrei să elimini acest punct din program?" onConfirm={async () => { await deleteDoc(doc(db, "trips", tripId, "itinerary", deleteDialog.id)); setDeleteDialog({ isOpen: false }); }} onCancel={() => setDeleteDialog({ isOpen: false })} />
    </div>
  );
}