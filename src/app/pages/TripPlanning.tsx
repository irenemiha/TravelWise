import { useParams, Link, useNavigate, useSearchParams } from "react-router";
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
  Check,
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
  where,
  updateDoc,
  arrayUnion,
  documentId
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [itineraryItems, setItineraryItems] = useState<any[]>([]);
  const [votedMembersCount, setVotedMembersCount] = useState(0);
  const [totalAvailableAttractions, setTotalAvailableAttractions] = useState(0);
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "member" | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isPendingInvite, setIsPendingInvite] = useState(false);

  // 1. AUTH & TRIP REAL-TIME DATA
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) { navigate("/"); return; }
      setAuthLoading(false);
    });

    if (!tripId) return;

    const tripRef = doc(db, "trips", tripId);
    const unsubTrip = onSnapshot(tripRef, async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTrip({ id: snap.id, ...data });

        const allUids = Array.from(new Set([data.ownerId, ...(data.participants || [])]));
        const usersRef = collection(db, "users");
        
        // REPARAȚIE: Căutăm după ID-ul documentului, nu după câmpul "uid"
        const qMembers = query(usersRef, where(documentId(), "in", allUids));
        const usersSnap = await getDocs(qMembers);
        
        const membersList = usersSnap.docs.map(uDoc => {
          const ud = uDoc.data();
          return {
            id: uDoc.id, // Folosim ID-ul documentului
            name: ud.name || ud.displayName || "Explorator",
            avatar: ud.photoURL || "",
            role: uDoc.id === data.ownerId ? "admin" : "member"
          } as Member;
        });

        if (auth.currentUser?.uid === data.ownerId) {
          setCurrentUserRole("admin");
        } else {
          setCurrentUserRole("member");
        }

        // Fallback logic dacă un user (de obicei adminul) nu e găsit în query
        allUids.forEach(uid => {
          if (!membersList.find(m => m.id === uid)) {
            const isCurrentAdmin = uid === data.ownerId;
            membersList.push({
              id: uid,
              // Prioritate: Numele din Trip > Numele Userului Logat > Text generic
              name: isCurrentAdmin 
                ? (data.ownerName || auth.currentUser?.displayName || "Administrator") 
                : "Membru nou...",
              avatar: isCurrentAdmin ? (auth.currentUser?.photoURL || "") : "",
              role: isCurrentAdmin ? "admin" : "member"
            });
          }
        });

        setMembers(membersList.sort((a, b) => (a.role === 'admin' ? -1 : 1)));
      } else {
        navigate("/dashboard");
      }
    });

    // 2. LISTENERS PENTRU METRICI REALE (LOGICA DIN APLICATIE)
    const unsubItinerary = onSnapshot(collection(db, "trips", tripId, "itinerary"), (snap) => {
      setItineraryItems(snap.docs.map(d => d.data()));
      setLoading(false);
    });

    const unsubVotes = onSnapshot(collection(db, "trips", tripId, "attractionVotes"), (snap) => {
      const uniqueVoters = new Set<string>();
      snap.docs.forEach(vDoc => {
        const vData = vDoc.data();
        if (vData.voters) Object.keys(vData.voters).forEach(uid => uniqueVoters.add(uid));
      });
      setVotedMembersCount(uniqueVoters.size);
    });

    const unsubActivity = onSnapshot(
        query(collection(db, "trips", tripId, "activity"), orderBy("timestamp", "desc"), limit(5)),
        (snap) => setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog)))
    );

    return () => {
      unsubscribeAuth();
      unsubTrip();
      unsubItinerary();
      unsubVotes();
      unsubActivity();
    };
  }, [tripId, navigate]);

  // 3. TARGET ATRACȚII REALE (DIN GEOAPIFY - CA ÎN APLICAȚIE)
  useEffect(() => {
    if (!trip?.destination || totalAvailableAttractions > 0) return;
    const fetchTarget = async () => {
      const cityName = trip.destination.split(",")[0].trim();
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`);
        const geoData = await geoRes.json();
        if (!geoData?.[0]) return;
        const { lat, lon } = geoData[0];
        const res = await fetch(`https://api.geoapify.com/v2/places?categories=tourism.attraction&filter=circle:${lon},${lat},15000&limit=50&apiKey=6627c045fcd14d76b5b547c8f3c54d17`);
        const data = await res.json();
        if (data.features) setTotalAvailableAttractions(data.features.length);
      } catch (e) { setTotalAvailableAttractions(20); }
    };
    fetchTarget();
  }, [trip?.destination]);

  // --- CALCULE METRICI REALE ---
  const totalActivities = itineraryItems.length;
  const attractionTarget = totalAvailableAttractions || 15;
  const attractionProgress = Math.min(Math.round((totalActivities / attractionTarget) * 100), 100);
  const votingProgress = Math.min(Math.round((votedMembersCount / (members.length || 1)) * 100), 100);
  const itineraryProgress = Math.min(Math.round((totalActivities / 10) * 100), 100);

  // INVITE HANDLING
  useEffect(() => {
    if (searchParams.get("invite") === "true") setIsPendingInvite(true);
  }, [searchParams]);

  const handleAcceptInvite = async () => {
    if (!tripId || !auth.currentUser) return;
    try {
      await updateDoc(doc(db, "trips", tripId), { participants: arrayUnion(auth.currentUser.uid) });
      setIsPendingInvite(false);
      toast.success("Ai intrat în grup!");
    } catch (e) { toast.error("Eroare la intrare."); }
  };

  const getInitials = (name: string) => (name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  const getAvatarColor = (id: string) => ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"][id.charCodeAt(0) % 5];

  if (authLoading || loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* Banner Invitație (Dacă e cazul) */}
      {isPendingInvite && (
        <div className="bg-blue-600 p-4 text-white flex flex-col md:flex-row items-center justify-center gap-4 sticky top-0 z-[60]">
          <p className="font-bold">Ai fost invitat să participi la această călătorie!</p>
          <div className="flex gap-2">
            <button onClick={handleAcceptInvite} className="bg-white text-blue-600 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"><Check className="w-4 h-4" /> Acceptă</button>
            <button onClick={() => setIsPendingInvite(false)} className="bg-blue-800 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest"><X className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative h-80 bg-gray-900">
        <div className="absolute inset-0 opacity-40 flex">
          <ImageWithFallback src={trip.image || `https://tse1.mm.bing.net/th?q=${encodeURIComponent(trip.destination + " landscape")}&w=1200&h=400&c=1&p=0`} alt={trip.destination} className="w-full h-full object-cover" />
          {/* <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" /> */}
        </div>
        <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-10">
          <div className="flex flex-col md:flex-row w-full md:items-end md:justify-between gap-6">
            <div className="text-white">
              <h1 className="text-3xl md:text-6xl font-black mb-4">{trip.name}</h1>
              <div className="flex flex-wrap gap-6 text-blue-100 dark:text-blue-200 font-bold">
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> {trip.destination}</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-purple-400" /> {trip.startDate} - {trip.endDate}</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-green-400" /> {members.length} Membri</div>
              </div>
            </div>
            <div className="flex gap-2 justify-center w-full max-w-xs">
              <button onClick={() => setShowInviteModal(true)} className="bg-white/20 text-white font-bold backdrop-blur-sm px-4 py-2 rounded-xl active:bg-white/30 transition-colors active:scale-95 flex items-center justify-center gap-2 flex-1 shadow-sm"><Share2 className="w-4 h-4" /><span>Distribuie</span></button>
              {currentUserRole === "admin" && <button onClick={() => navigate(`/trip/${id}/trip-settings`)} className="bg-white/20 text-white font-bold backdrop-blur-sm px-4 py-2 rounded-xl active:bg-white/30 transition-colors active:scale-95 flex items-center justify-center gap-2 flex-1 shadow-sm"><Settings className="w-4 h-4" /><span>Setări</span></button>}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm mb-10 p-2 flex border border-gray-100 dark:border-gray-800 transition-all">
          <button className="flex-1 px-2 py-2.5 font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg text-center ">Prezentare</button>
          <Link to={`/explore/${tripId}`} className="flex-1 px-2 py-2.5 font-bold text-gray-600 dark:text-gray-400 rounded-lg text-center">Explorează</Link>
          <Link to={`/itinerary/${tripId}`} className="flex-1 px-2 py-2.5 font-bold text-gray-500 dark:text-gray-400 rounded-lg text-center">Itinerariu</Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {/* PROGRES REALE (SYNC CU APP) */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-50 dark:border-gray-800 transition-all">
              <h2 className="font-bold text-gray-400 dark:text-white mb-8 text-center">Progres Planificare</h2>
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between mb-3 text-gray-600 dark:text-gray-400 font-bold">
                    <span>Atracții adăugate</span>
                    <span className="text-blue-600">{totalActivities}/{attractionTarget}</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${attractionProgress}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-3 text-gray-600 dark:text-gray-400 font-bold">
                    <span>Membrii care au votat</span>
                    <span className="text-purple-600">{votedMembersCount}/{members.length}</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full transition-all duration-1000" style={{ width: `${votingProgress}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-3 text-gray-600 dark:text-gray-400 font-bold">
                    <span>Finalizare Itinerariu</span>
                    <span className="text-green-600">{itineraryProgress}%</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full transition-all duration-1000" style={{ width: `${itineraryProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-50 dark:border-gray-800">
              <h2 className="font-bold text-gray-400 dark:text-white text-center">Activitate Recentă</h2>
              <div className="space-y-8">
                {activities.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center italic py-4">Nu există activitate recentă.</p>
                ) : activities.map((act) => (
                  <div key={act.id} className="flex gap-5 items-start">
                    <div className={`w-12 h-12 rounded-xl ${getAvatarColor(act.userName)} flex items-center justify-center text-white font-black text-xs shadow-lg`}>
                      {getInitials(act.userName)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium">
                        <span className="font-black text-blue-600">{act.userName}</span> {act.action}{" "}
                        <span className="font-black underline decoration-blue-500/30">{act.targetName}</span>
                      </p>
                      <p className="text-[9px] text-gray-400 font-black uppercase mt-1 tracking-widest">acum</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-10">
            {/* Members Sidebar */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-8 w-full flex flex-col items-center border dark:border-gray-800 transition-colors">
              <div className="flex flex-col items-center justify-center mb-4 gap-2 w-full relative">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center">Membri ({members.length})</h2>
                {currentUserRole === "admin" && <button onClick={() => setShowInviteModal(true)} className="text-blue-600 dark:text-blue-400 absolute right-0 top-0 p-1"><UserPlus className="w-5 h-5" /></button>}
              </div>
              <div className="space-y-6">
                {members.map((member) => (
                  <div key={member.id} className="flex flex-col items-center gap-3 group">
                    <div className="relative">
                      {member.role === "admin" && <div className="absolute -inset-1 bg-gradient-to-tr from-yellow-400 via-orange-500 to-yellow-600 rounded-full blur-[2px] opacity-70 animate-pulse" />}
                      <div className={`w-12 h-12 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white font-bold relative z-10 border-2 border-white dark:border-gray-950 transition-transform group-hover:scale-105`}>
                        {getInitials(member.name)}
                      </div>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="text-gray-900 dark:text-gray-100 font-bold">{member.name}</p>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{member.role === "admin" ? "Administrator Călătorie" : "Membru Grup"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-blue-950 via-purple-900 to-fuchsia-950 rounded-xl shadow-2xl p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[80px] rounded-full" />
              <h2 className="font-black mb-8 uppercase text-center text-blue-500">Următorii Pași</h2>
              <div className="space-y-6">
                {[
                  { t: "Adaugă 5 atracții", d: "Construiește baza planului." },
                  { t: "Invită prietenii", d: "O aventură se împarte cu echipa." },
                  { t: "Votați prioritățile", d: "Alegeți ce merită văzut." }
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 font-black text-xs">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase">{step.t}</p>
                      <p className="text-sm text-gray-400 font-medium">{step.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to={`/explore/${tripId}`} className="mt-10 w-full font-black text-sm bg-white text-gray-950 py-5 rounded-xl hover:bg-blue-50 transition-all text-center flex items-center justify-center gap-3 uppercase shadow-xl">
                Lansează explorarea <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] max-w-md w-full p-10 border border-gray-100 dark:border-gray-800 shadow-2xl relative">
            <button onClick={() => setShowInviteModal(false)} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"><X className="w-6 h-6" /></button>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter uppercase">Invită Prietenii</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-10 font-medium">Link-ul tău de acces rapid în grup.</p>
            
            <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl mb-10 border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="break-all text-sm font-black text-blue-600 dark:text-blue-400 tracking-tight">
                {window.location.origin}/trip/${tripId}?invite=true
              </div>
            </div>
            
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/trip/${tripId}?invite=true`);
                toast.success("Link copiat!");
                setShowInviteModal(false);
              }}
              className="w-full py-5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 uppercase text-xs tracking-[0.2em] transition-all active:scale-95"
            >
              Copiază Link Unic
            </button>
          </div>
        </div>
      )}
    </div>
  );
}