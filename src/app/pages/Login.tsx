import { useState } from "react";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, ArrowRight, Chrome, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Bine ai revenit!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Eroare la autentificare: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (e) {
      toast.error("Eroare la Google Login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-10 border dark:border-gray-800">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Login</h2>
        <p className="text-gray-500 mb-8 font-medium">Continuă aventura cu TravelWise</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input type="password" placeholder="Parolă" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
            {loading ? <Loader2 className="animate-spin" /> : <>Loghează-te <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100 dark:border-gray-800"></div></div>
          <div className="relative flex justify-center text-xs uppercase font-black text-gray-400"><span className="bg-white dark:bg-gray-900 px-4">sau</span></div>
        </div>

        <button onClick={loginWithGoogle} className="w-full py-4 border dark:border-gray-800 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white transition-all">
          <Chrome className="w-5 h-5 text-blue-500" /> Login cu Google
        </button>

        <p className="mt-8 text-center text-sm text-gray-500 font-bold">
          Nu ai cont? <Link to="/signup" className="text-blue-600 hover:underline">Creează unul aici</Link>
        </p>
      </div>
    </div>
  );
}