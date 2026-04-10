import { useState, useEffect } from "react"; // Am adăugat useEffect
import { auth } from "../../firebase";
import { 
  signInWithEmailAndPassword, 
  signInWithRedirect, 
  GoogleAuthProvider,
  onAuthStateChanged // Am adăugat asta pentru a detecta logarea automată
} from "firebase/auth";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- LOGICA DE REDIRECT AUTO-DETECTION ---
  useEffect(() => {
    // Ascultăm starea de auth. Când Google ne trimite înapoi, 
    // acest listener va prinde user-ul imediat ce Firebase îl procesează.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Bine ai revenit!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Eroare la autentificare: Parola sau email incorect.");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithRedirect(auth, provider);
      // Nu punem navigate aici, deoarece pagina se va părăsi oricum
    } catch (e) {
      toast.error("Eroare la inițierea logării Google");
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-[#1e1b4b] via-[#581c87] to-[#020617] flex items-center justify-center p-6 transition-all duration-500">
      
      <div className="max-w-md w-full bg-white dark:bg-[#0f172a]/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border border-gray-100 dark:border-white/5 animate-in fade-in zoom-in duration-300">
        
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tighter">Login</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Continuă aventura cu TravelWise</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="email"
              placeholder="Email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 dark:text-white transition-all font-medium" 
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="password"
              autoComplete="current-password"
              placeholder="Parolă" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-transparent focus:border-blue-500/50 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 dark:text-white transition-all font-medium" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Loghează-te <ArrowRight className="w-4 h-4 stroke-[3]" /></>}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100 dark:border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black text-gray-400">
            <span className="bg-white dark:bg-[#161d2f] px-4 tracking-[0.3em]">sau</span>
          </div>
        </div>

        <button 
          onClick={loginWithGoogle} 
          className="w-full py-4 border border-gray-200 dark:border-white/5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 dark:text-white transition-all active:scale-95"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-xs uppercase tracking-widest font-black">Loghează-te cu Google</span>
        </button>

        <p className="mt-10 text-center text-[11px] text-gray-500 font-bold uppercase tracking-widest">
          Nu ai cont? <Link to="/signup" className="text-blue-600 hover:text-blue-500 transition-colors">Creează unul aici</Link>
        </p>
      </div>
    </div>
  );
}