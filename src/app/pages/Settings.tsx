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
  
  // --- STATE-URI SETĂRI ---
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme === "dark";
    return document.documentElement.classList.contains("dark");
  });

  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 1. AUTH & LOAD DATA: Ascultăm user-ul și încărcăm preferințele din Firestore
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

  // 2. DARK MODE SYNC: Aplicăm clasa pe document și salvăm în localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // 3. FIREBASE UPDATES: Salvarea preferințelor în Firestore
  const updatePreference = async (key: string, value: boolean) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { [key]: value });
    } catch (e) {
      toast.error("Eroare la salvarea setărilor.");
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

  // 4. DELETE ACCOUNT: Ștergerea definitivă a utilizatorului
  const handleDeleteAccount = async () => {
    if (!user) return;
    setIsDeleting(true);
    
    try {
      await deleteUser(user);
      toast.success("Contul tău a fost șters definitiv.");
      navigate("/login");
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        toast.error("Trebuie să te re-loghezi pentru a putea șterge contul.");
      } else {
        toast.error("Eroare la ștergerea contului.");
      }
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- SUB-COMPONENTE INTERNE ---

  const SettingSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="mb-10">
      <h2 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em] mb-4 ml-6">
        {title}
      </h2>
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ icon: Icon, title, desc, toggle, action, colorName = "blue" }: any) => {
    // Mapare culori pentru a repara vizibilitatea iconițelor
    const colorClasses: { [key: string]: { bg: string, text: string } } = {
      blue: { bg: "bg-blue-600", text: "text-blue-600" },
      purple: { bg: "bg-purple-600", text: "text-purple-600" },
      green: { bg: "bg-green-600", text: "text-green-600" },
      orange: { bg: "bg-orange-600", text: "text-orange-600" },
      indigo: { bg: "bg-indigo-600", text: "text-indigo-600" },
    };

    const colors = colorClasses[colorName] || colorClasses.blue;

    return (
      <div className="flex items-center justify-between p-6 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
        <div className="flex items-center gap-5">
          <div className={`p-3 rounded-2xl ${colors.bg} bg-opacity-20 flex items-center justify-center shadow-sm`}>
            <Icon className={`w-5 h-5 ${colors.text} stroke-[2.5px]`} />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{desc}</p>
          </div>
        </div>
        
        {toggle !== undefined ? (
          <button 
            onClick={action}
            className={`w-14 h-8 rounded-full transition-all relative flex items-center px-1 ${toggle ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${toggle ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        ) : (
          <button onClick={action} className="p-2 text-gray-300 hover:text-blue-600 dark:hover:text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 transition-colors duration-300 min-h-screen pb-20 pt-12">
      <div className="max-w-3xl mx-auto px-6">
        
        {/* Header cu buton înapoi */}
        <div className="flex items-center gap-6 mb-12">
          <button 
            onClick={() => navigate(-1)} 
            className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 hover:text-blue-600 transition-all active:scale-90"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Setări Sistem</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">Personalizează platforma TravelWise</p>
          </div>
        </div>

        {/* SECȚIUNE: ASPECT */}
        <SettingSection title="Aspect și Interfață">
          <SettingRow 
            icon={Bell} 
            title="Notificări Mobile" 
            desc="Alerte despre voturi și invitații noi."
            toggle={notifications}
            action={handleToggleNotifications}
            colorName="blue"
          />
          <SettingRow 
            icon={darkMode ? Sun : Moon} 
            title="Mod Întunecat" 
            desc="Comută între tema luminoasă și cea dark."
            toggle={darkMode}
            action={() => setDarkMode(!darkMode)}
            colorName="purple"
          />
          <SettingRow 
            icon={MapPin} 
            title="Servicii Locație" 
            desc="Permite accesul la GPS pentru hărți."
            toggle={location}
            action={handleToggleLocation}
            colorName="green"
          />
        </SettingSection>

        {/* SECȚIUNE: CONT */}
        <SettingSection title="Cont și Securitate">
          <SettingRow 
            icon={Globe} 
            title="Limbă Aplicație" 
            desc="Română (implicit)"
            action={() => toast.info("Alte limbi vor fi disponibile curând!")}
            colorName="orange"
          />
          <SettingRow 
            icon={Lock} 
            title="Schimbă Parola" 
            desc="Protejează-ți accesul în cont."
            action={() => toast.info("Accesează Reset Password din pagina de Login.")}
            colorName="indigo"
          />
        </SettingSection>

        {/* SECȚIUNE: DANGER ZONE */}
        <div className="mt-12 bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 overflow-hidden">
           <button 
             onClick={() => setShowDeleteConfirm(true)}
             className="w-full flex items-center justify-between p-8 hover:bg-red-100/50 dark:hover:bg-red-900/20 transition-all group"
           >
             <div className="flex items-center gap-5">
                <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-600/20 group-hover:scale-110 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-black text-red-600 uppercase tracking-tight">Șterge Contul Definitiv</p>
                  <p className="text-xs text-red-500/70 font-bold">Această acțiune va șterge toate datele tale.</p>
                </div>
             </div>
             <ChevronRight className="w-5 h-5 text-red-300" />
           </button>
        </div>

        <div className="text-center mt-12 mb-10">
          <p className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.5em]">
            TravelWise Web Edition v1.0.4
          </p>
        </div>
      </div>

      {/* MODAL CONFIRMARE ȘTERGERE */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Ștergere Cont"
        message="Atenție! Vei pierde toate călătoriile, mesajele și locațiile salvate. Ești absolut sigur că vrei să continui?"
        confirmText={isDeleting ? "Se șterge..." : "Șterge definitiv"}
        cancelText="Anulează"
        onConfirm={handleDeleteAccount}
        onCancel={() => !isDeleting && setShowDeleteConfirm(false)}
      />
    </div>
  );
}