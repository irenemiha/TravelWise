import { useState } from "react";
import { auth, db } from "../../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router";
import { User, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      
      // Creăm documentul user-ului în Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        photoURL: "",
        savedAttractions: [],
        trips: [],
        createdAt: new Date().toISOString()
      });

      toast.success("Cont creat cu succes!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Eroare: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-r from-blue-950 via-purple-900 to-fuchsia-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl p-10 border dark:border-gray-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Cont Nou</h2>
        <p className="text-gray-500 mb-8 font-medium">Alătură-te comunității TravelWise</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Nume Complet" required value={name} onChange={(e) => setName(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white" />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white" />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input type="password" placeholder="Parolă (min. 6 caractere)" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl outline-none focus:ring-2 focus:ring-blue-600 dark:text-white" />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest">
            {loading ? <Loader2 className="animate-spin" /> : "Creează Cont"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500 font-bold">
          Ai deja cont? <Link to="/login" className="text-blue-600 hover:underline">Loghează-te</Link>
        </p>
      </div>
    </div>
  );
}