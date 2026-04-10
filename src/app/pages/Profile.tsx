import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { 
  User, 
  Settings, 
  LogOut, 
  Heart, 
  ChevronRight, 
  Camera, 
  Shield, 
  Loader2,
  Calendar,
  Compass
} from "lucide-react";
import { auth, db } from "../../firebase";
import { doc, onSnapshot, updateDoc, collection, query, where } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import { ConfirmDialog } from "../components/ConfirmDialog";

interface UserData {
  name: string;
  email: string;
  photoURL: string;
  savedAttractions?: string[];
  uid?: string;
}

export function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState({ trips: 0, saved: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const unsubUser = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data() as UserData;
            setUserData({ ...data, uid: user.uid });
            setStats(prev => ({ ...prev, saved: data.savedAttractions?.length || 0 }));
          } else {
            setUserData({
              name: user.displayName || "Utilizator",
              email: user.email || "",
              photoURL: user.photoURL || "",
              savedAttractions: [],
              uid: user.uid
            });
          }
        });

        const tripsQuery = query(
          collection(db, "trips"),
          where("participants", "array-contains", user.uid)
        );
        const unsubTrips = onSnapshot(tripsQuery, (snap) => {
          setStats(prev => ({ ...prev, trips: snap.size }));
          setLoading(false);
        });

        return () => {
          unsubUser();
          unsubTrips();
        };
      } else {
        navigate("/");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Te-ai deconectat!");
      navigate("/");
    } catch (error) {
      toast.error("Eroare la deconectare.");
    }
  };

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userData?.uid) return;
    if (file.size > 1000000) { toast.error("Imaginea este prea mare (max 1MB)"); return; }

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64 = reader.result as string;
        await updateDoc(doc(db, "users", userData.uid!), { photoURL: base64 });
        toast.success("Poză actualizată!");
      } catch (err) {
        toast.error("Eroare la salvare.");
      } finally {
        setIsUploading(false);
      }
    };
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">Se încarcă profilul...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-12">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* Profile Header Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-8">
          <div className="h-40 bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600"></div>
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              <div className="relative">
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                <div className="w-32 h-32 rounded-3xl bg-blue-500 border-4 border-white dark:border-gray-900 flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden relative">
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                      <Loader2 className="animate-spin text-white" />
                    </div>
                  )}
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(userData?.name || "U")
                  )}
                </div>
                <button 
                  onClick={handlePhotoClick}
                  className="absolute bottom-2 right-2 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 text-blue-600 dark:text-blue-400 active:scale-90 transition-all z-30"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-3 pb-2">
                <Link to="/edit-profile" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center">
                  Editează Profil
                </Link>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                {userData?.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">{userData?.email}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.trips}</span>
            <span className="text-[12px] font-bold text-gray-400 tracking-widest">Călătorii Active</span>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-3">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-gray-900 dark:text-white">{stats.saved}</span>
            <span className="text-[12px] font-bold text-gray-400 tracking-widest">Locații Salvate</span>
          </div>
        </div>

        {/* Menu Options */}
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] px-6">
            Activitatea mea
          </h2>
          
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <Link to="/dashboard" className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700 dark:text-gray-200">Vezi Călătoriile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </Link>

            <div className="h-[1px] bg-gray-50 dark:bg-gray-800 mx-6"></div>

            <Link to="/saved-attractions" className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <Heart className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700 dark:text-gray-200">Atracții Favorite</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-red-500 transition-colors" />
            </Link>
          </div>

          <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] px-6 pt-6">
            Setări sistem
          </h2>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
            <Link to="/settings" className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700 dark:text-gray-200">Setări Aplicație</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-600 transition-colors" />
            </Link>

            <div className="h-[1px] bg-gray-50 dark:bg-gray-800 mx-6"></div>

            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full flex items-center justify-between p-6 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors group"
            >
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-red-100/50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
                  <LogOut className="w-5 h-5" />
                </div>
                <span className="font-bold text-red-600">Deconectare Cont</span>
              </div>
              <ChevronRight className="w-5 h-5 text-red-200 group-hover:text-red-500 transition-colors" />
            </button>
          </div>
          
          <div className="text-center pt-8">
            <p className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.5em]">
              TravelWise Cloud v1.0.4
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Deconectare"
        message="Ești sigur că vrei să părăsești aventura TravelWise?"
        confirmText="Deconectare"
        cancelText="Anulează"
        onConfirm={handleSignOut}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}