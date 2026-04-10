import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Camera, Check, Loader2, ShieldCheck } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { auth, db } from "../../firebase";
import { updateProfile, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function EditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { navigate("/"); return; }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setName(data.name || "");
          setPhone(data.phone || "");
          setBio(data.bio || "");
        } else { setName(user.displayName || ""); }
        setEmail(user.email || "");
      } finally { setIsLoading(false); }
    });
    return () => unsub();
  }, [navigate]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(), email: user.email, phone, bio, updatedAt: new Date()
      }, { merge: true });
      await updateProfile(user, { displayName: name.trim() });
      toast.success("Profil actualizat!");
      navigate("/profile");
    } catch (e) { toast.error("Eroare la salvare."); } finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-10">
             <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:text-blue-600 transition-all"><ArrowLeft className="w-5 h-5" /></button>
             <h1 className="text-xl font-black uppercase tracking-widest text-gray-900 dark:text-white">Editează Profil</h1>
             <div className="w-10"></div>
          </div>

          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-3xl bg-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl overflow-hidden border-4 border-white dark:border-gray-800">
                {auth.currentUser?.photoURL ? <img src={auth.currentUser.photoURL} className="w-full h-full object-cover" /> : name[0]?.toUpperCase()}
              </div>
              <button onClick={() => toast.info("Funcția va fi activă curând")} className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all border-2 border-white dark:border-gray-800">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {[
              { label: "Nume Complet", val: name, set: setName, type: "text", dis: false },
              { label: "Email (Protejat)", val: email, set: null, type: "email", dis: true },
              { label: "Telefon", val: phone, set: setPhone, type: "tel", dis: false }
            ].map((field, i) => (
              <div key={i} className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">{field.label}</label>
                <input 
                  type={field.type} value={field.val} disabled={field.dis}
                  onChange={(e) => field.set && field.set(e.target.value)}
                  className={`w-full p-5 rounded-2xl border-none font-bold transition-all ${field.dis ? 'bg-gray-100 dark:bg-gray-800/50 text-gray-400 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600'}`}
                />
              </div>
            ))}
            
            <button 
              onClick={handleSave} disabled={isSaving}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all mt-6 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Salvează Modificările <Check className="w-5 h-5" /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}