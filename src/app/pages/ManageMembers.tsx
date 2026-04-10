import { useNavigate, useParams } from "react-router";
import { ChevronLeft, UserMinus, Shield, Link as LinkIcon, MoreVertical, Copy, Loader2, Users2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc, arrayRemove, collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function ManageMembers() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trip, setTrip] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
      else setAuthLoading(false);
    });

    if (!id) return;
    const unsub = onSnapshot(doc(db, "trips", id), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTrip(data);
        const usersSnap = await getDocs(query(collection(db, "users"), where("uid", "in", data.participants)));
        setMembers(usersSnap.docs.map(d => ({ 
          id: d.id, ...d.data(), 
          role: d.id === data.ownerId ? "admin" : "member" 
        })));
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id, navigate]);

  const removeMember = async (mId: string) => {
    try {
      await updateDoc(doc(db, "trips", id!), { participants: arrayRemove(mId) });
      toast.success("Membru eliminat.");
    } catch (e) { toast.error("Eroare Firebase."); }
  };

  if (authLoading || loading) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6">
      <div className="max-w-3xl mx-auto py-12">
        <div className="flex justify-between items-center mb-8">
           <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 font-black uppercase text-[10px] tracking-widest"><ChevronLeft /> Înapoi</button>
           <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/join/${id}`); toast.success("Link copiat!"); }} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-600/20 flex items-center gap-2"><LinkIcon className="w-4 h-4"/> Invită</button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex items-center gap-4">
             <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600"><Users2 /></div>
             <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Membrii Grupului</h1>
          </div>

          <div className="divide-y dark:divide-gray-800">
            {members.map((m) => (
              <div key={m.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black shadow-lg">
                    {m.photoURL ? <img src={m.photoURL} className="w-full h-full object-cover rounded-2xl" /> : m.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-gray-900 dark:text-white">{m.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${m.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>{m.role}</span>
                       <span className="text-[10px] text-gray-400 font-bold">{m.email}</span>
                    </div>
                  </div>
                </div>
                {auth.currentUser?.uid === trip.ownerId && m.id !== trip.ownerId && (
                  <button onClick={() => removeMember(m.id)} className="p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><UserMinus className="w-5 h-5" /></button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}