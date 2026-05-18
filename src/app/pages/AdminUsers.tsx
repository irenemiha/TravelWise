import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Users, Trash2, ShieldCheck, Mail, Search, ArrowLeft, Edit2, X, Check } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { toast } from "sonner";

// IMPORTURI FIREBASE REALE
import { db, auth } from "../../firebase";
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export function AdminUsers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  // Stări pentru editare inline (Modal)
  const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("user");
  const [isSaving, setIsSaving] = useState(false);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user || localStorage.getItem('isAdminLoggedIn') !== 'true') {
        navigate("/");
        return;
      }

      const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserProfile[];
        
        setUsers(usersData);
        setLoading(false);
      }, (error) => {
        console.error("Eroare snapshot utilizatori:", error);
        setLoading(false);
      });

      return () => unsubscribeUsers();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // Deschide fereastra de editare cu datele utilizatorului selectat
  const handleOpenEdit = (user: UserProfile) => {
    setUserToEdit(user);
    setEditName(user.name || "");
    setEditRole(user.role || "user");
  };

  // Salvează modificările în Firestore
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;

    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", userToEdit.id);
      await updateDoc(userDocRef, {
        name: editName.trim(),
        role: editRole
      });
      toast.success("Profilul utilizatorului a fost actualizat!");
      setUserToEdit(null); // Închidem modalul
    } catch (error) {
      console.error("Eroare la salvare:", error);
      toast.error("Nu s-au putut salva modificările.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteDoc(doc(db, "users", userToDelete));
        toast.success("Utilizatorul a fost șters definitiv.");
      } catch (error) {
        toast.error("Eroare la ștergere.");
      } finally {
        setUserToDelete(null);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) || 
    (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-950 p-6 transition-colors duration-300 min-h-screen pb-24">
      <div className="w-full flex flex-col max-w-md mx-auto">
        
        {/* Header cu buton de Back */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate("/admin-dashboard")}
            className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-500 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
              Utilizatori ({users.length})
            </h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Management Conturi</p>
          </div>
        </div>

        {/* Bara de Căutare */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Caută după nume sau email..."
            className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Lista de Utilizatori */}
        <div className="flex flex-col gap-3">
          {loading ? (
            <div className="text-center py-10 text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
              Se încarcă baza de date...
            </div>
          ) : (
            filteredUsers.map(user => (
              <div 
                key={user.id}
                onClick={() => handleOpenEdit(user)}
                className="bg-white dark:bg-gray-900 p-4 rounded-[24px] border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm hover:scale-[1.01] hover:border-blue-200 dark:hover:border-blue-900 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-sm uppercase group-hover:bg-blue-100 transition-colors">
                    {user.name?.[0] || "?"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.name || "Fără Nume"}</span>
                      {user.role === "admin" && (
                        <ShieldCheck className="w-3 h-3 text-purple-500 shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium truncate">
                      <Mail className="w-3 h-3 text-gray-400" /> {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handleOpenEdit(user)}
                    className="p-2 text-gray-400 hover:text-blue-500 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {user.role !== "admin" && (
                    <button 
                      onClick={() => setUserToDelete(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL MODIFICARE UTILIZATOR */}
      {userToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form 
            onSubmit={handleSaveChanges}
            className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-6 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight">Editează Utilizator</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Modificare drepturi și profil</p>
              </div>
              <button 
                type="button"
                onClick={() => setUserToEdit(null)}
                className="p-2 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-xl"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nume */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Nume Complet</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl py-3.5 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              />
            </div>

            {/* Rol */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Rolul contului</label>
              <select 
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 rounded-2xl py-3.5 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
              >
                <option value="user">User (Utilizator Simplu)</option>
                <option value="admin">Admin (Administrator)</option>
              </select>
            </div>

            {/* Email - Read Only */}
            <div className="space-y-1.5 opacity-60">
              <label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Adresă Email (Securizată)</label>
              <div className="w-full bg-gray-100 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl py-3.5 px-4 text-sm text-gray-500 font-medium">
                {userToEdit.email}
              </div>
            </div>

            {/* Acțiuni */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setUserToEdit(null)}
                className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-black uppercase text-xs tracking-widest rounded-2xl transition-all"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3.5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {isSaving ? "Se salvează..." : <><Check className="w-4 h-4" /> Salvează</>}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={userToDelete !== null}
        title="Șterge Utilizator"
        message="Ești sigur că vrei să elimini acest cont? Toate datele asociate vor fi șterse din cloud definitiv."
        onConfirm={confirmDelete}
        onCancel={() => setUserToDelete(null)}
        confirmText="Șterge"
        cancelText="Anulează"
      />
    </div>
  );
}