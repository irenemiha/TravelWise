import { useNavigate } from "react-router";
import { toast } from "sonner";
import { 
  ArrowLeft, Bell, Moon, MapPin, Globe, 
  ChevronRight, Lock, Trash2, Sun, Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";

// IMPORTURI FIREBASE
import { auth, db } from "../../firebase";
import { deleteUser, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // LOGICA MODIFICATĂ: Inițializare precisă din localStorage sau preferințe sistem
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate("/");
        return;
      }
      setUser(currentUser);
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setNotifications(data.pushNotifications ?? true);
          setLocation(data.gpsEnabled ?? true);
        }
      } catch (e) {
        console.error("Error loading settings:", e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, [navigate]);

  // LOGICA MODIFICATĂ: Persistență garantată și aplicare globală
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const updatePreference = async (key: string, value: boolean) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { [key]: value });
    } catch (e) {
      toast.error("Eroare la salvare.");
    }
  };

  const handleToggleNotifications = () => {
    const newValue = !notifications;
    setNotifications(newValue);
    updatePreference("pushNotifications", newValue);
  };

  const handleToggleLocation = () => {
    const newValue = !location;
    setLocation(newValue);
    updatePreference("gpsEnabled", newValue);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await deleteUser(user);
      toast.success("Cont șters.");
      navigate("/login");
    } catch (error: any) {
      toast.error("Trebuie să te re-loghezi pentru a șterge contul.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const SettingRow = ({ icon: Icon, title, desc, toggle, action, colorVariant }: any) => {
    const colorStyles: { [key: string]: string } = {
      blue: "bg-blue-600 text-blue-600",
      purple: "bg-purple-600 text-purple-600",
      green: "bg-green-600 text-green-600",
      orange: "bg-orange-600 text-orange-600",
      indigo: "bg-indigo-600 text-indigo-600",
    };

    const style = colorStyles[colorVariant] || colorStyles.blue;
    const bgColorClass = style.split(' ')[0];
    const textColorClass = style.split(' ')[1];

    return (
      <div className="flex items-center justify-between p-6 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-2xl ${bgColorClass} bg-opacity-20 flex items-center justify-center shadow-sm`}>
            <Icon className={`w-5 h-5 ${textColorClass} stroke-[2.5px]`} />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{desc}</p>
          </div>
        </div>
        
        {toggle !== undefined ? (
          <button 
            onClick={action}
            className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${toggle ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${toggle ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        ) : (
          <button onClick={action} className="p-2 text-gray-300 hover:text-blue-600 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 min-h-screen pb-20 pt-12 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        
        <div className="flex items-center gap-6 mb-12">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tighter">Setări Sistem</h1>
          </div>
        </div>

        {/* ASPECT */}
        <div className="mb-10">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-6">Aspect</h2>
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <SettingRow 
              icon={Bell} title="Notificări" desc="Alerte voturi și invitații." 
              toggle={notifications} action={handleToggleNotifications} colorVariant="blue" 
            />
            <SettingRow 
              icon={darkMode ? Moon : Sun} title="Mod Întunecat" desc="Schimbă tema vizuală." 
              toggle={darkMode} action={() => setDarkMode(!darkMode)} colorVariant="purple" 
            />
            <SettingRow 
              icon={MapPin} title="Locație GPS" desc="Permite accesul la hărți." 
              toggle={location} action={handleToggleLocation} colorVariant="green" 
            />
          </div>
        </div>

        {/* CONT */}
        <div className="mb-10">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-6">Cont</h2>
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <SettingRow 
              icon={Globe} title="Limbă" desc="Română (implicit)" 
              action={() => toast.info("Disponibil curând")} colorVariant="orange" 
            />
            <SettingRow 
              icon={Lock} title="Securitate" desc="Schimbă parola contului" 
              action={() => navigate("/login")} colorVariant="indigo" 
            />
          </div>
        </div>

        {/* DELETE */}
        <div className="mt-12 bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 overflow-hidden">
           <button onClick={() => setShowDeleteConfirm(true)} className="w-full flex items-center justify-between p-8 hover:bg-red-100/50 transition-all group">
             <div className="flex items-center gap-5">
                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-red-600">Șterge Contul</p>
                  <p className="text-xs text-red-500/70 font-bold">Acțiune ireversibilă</p>
                </div>
             </div>
             <ChevronRight className="w-5 h-5 text-red-300" />
           </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm} title="Ștergere Cont" message="Ești sigur că vrei să ștergi totul definitiv?"
        confirmText={isDeleting ? "Se șterge..." : "Șterge"} cancelText="Anulează"
        onConfirm={handleDeleteAccount} onCancel={() => !isDeleting && setShowDeleteConfirm(false)}
      />
    </div>
  );
}