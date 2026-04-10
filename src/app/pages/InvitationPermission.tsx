import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Check, Loader2, Users2, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { db } from "../../firebase";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";

export function InvitationPermissions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selected, setSelected] = useState("admin");
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, "trips", id), (snap) => {
      if (snap.exists()) setSelected(snap.data().invitationPolicy || "admin");
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  const handleSelect = async (optId: string) => {
    if (!id || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, "trips", id), { invitationPolicy: optId });
      toast.success("Permisiuni actualizate!");
    } catch (e) { toast.error("Eroare server."); } finally { setIsUpdating(false); }
  };

  if (loading) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6">
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4 mb-10">
             <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
             <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Cine poate invita?</h1>
          </div>

          <div className="grid gap-4">
            {[
              { id: "all", title: "Oricine din grup", desc: "Toți membrii pot genera link-uri de invitație.", icon: Users2 },
              { id: "admin", title: "Doar Administratorii", desc: "Doar persoana care a creat grupul poate invita membri.", icon: ShieldCheck }
            ].map((opt) => (
              <button 
                key={opt.id} onClick={() => handleSelect(opt.id)}
                className={`w-full p-8 rounded-3xl border-2 text-left transition-all relative overflow-hidden group ${selected === opt.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-50 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${selected === opt.id ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                      <opt.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black mb-1 ${selected === opt.id ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>{opt.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">{opt.desc}</p>
                    </div>
                  </div>
                  {selected === opt.id && <div className="bg-blue-600 p-1.5 rounded-full"><Check className="w-4 h-4 text-white" /></div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}