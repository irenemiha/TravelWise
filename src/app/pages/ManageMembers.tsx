import { useNavigate, useParams } from "react-router";
import { 
  ChevronLeft, 
  UserMinus, 
  Shield, 
  Link as LinkIcon, 
  MoreVertical, 
  UserCircle,
  Check,
  Copy,
  Loader2,
  Users2,
  ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// IMPORTURI FIREBASE
import { db, auth } from "../../firebase";
import { 
  doc, 
  onSnapshot, 
  updateDoc, 
  arrayRemove, 
  arrayUnion,
  collection, 
  query, 
  where, 
  getDocs,
  documentId 
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface Member {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: "owner" | "admin" | "member";
  initials: string;
}

export function ManageMembers() {
  const navigate = useNavigate();
  const { id } = useParams();
  const tripId = id || "";
  
  const [trip, setTrip] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  const [showLinkModal, setShowLinkModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);

  const inviteLink = `${window.location.origin}/trip/${tripId}?invite=true`;

  // Verificăm dacă cel logat este creatorul călătoriei (Adminul principal)
  const currentUserId = auth.currentUser?.uid;
  const isOwner = trip?.ownerId === currentUserId;

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/");
      else setAuthLoading(false);
    });

    if (!tripId) return;

    const tripRef = doc(db, "trips", tripId);
    const unsubscribe = onSnapshot(tripRef, async (snap) => {
      if (snap.exists()) {
        const tripData = snap.data();
        setTrip(tripData);

        if (tripData.participants && tripData.participants.length > 0) {
          const usersRef = collection(db, "users");
          
          const q = query(usersRef, where(documentId(), "in", tripData.participants));
          const usersSnap = await getDocs(q);
          
          const membersList = usersSnap.docs.map(uDoc => {
            const userData = uDoc.data();
            
            let role: "owner" | "admin" | "member" = "member";
            if (uDoc.id === tripData.ownerId) role = "owner";
            else if (tripData.admins?.includes(uDoc.id)) role = "admin";
            
            const name = userData.name || userData.displayName || "Explorator";

            return {
              id: uDoc.id,
              name: name,
              email: userData.email || "",
              photoURL: userData.photoURL,
              role: role,
              initials: name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2)
            } as Member;
          });
          
          const sortedMembers = membersList.sort((a, b) => {
            if (a.role === 'owner') return -1;
            if (b.role === 'owner') return 1;
            return 0;
          });

          setMembers(sortedMembers);
        }
      }
      setLoading(false);
    });

    return () => { unsubAuth(); unsubscribe(); };
  }, [tripId, navigate]);

  const handleChangeRole = async (memberId: string, currentRole: string) => {
    if (!isOwner || memberId === trip.ownerId) return;

    try {
      const tripRef = doc(db, "trips", tripId);
      if (currentRole === "member") {
        await updateDoc(tripRef, { admins: arrayUnion(memberId) });
        toast.success("Membru promovat la Administrator.");
      } else {
        await updateDoc(tripRef, { admins: arrayRemove(memberId) });
        toast.info("Drepturi de Administrator revocate.");
      }
      setMemberToEdit(null);
    } catch (e) {
      toast.error("Eroare la schimbarea rolului.");
    }
  };

  const confirmDelete = async () => {
    if (!memberToDelete || !tripId) return;
    try {
      await updateDoc(doc(db, "trips", tripId), {
        participants: arrayRemove(memberToDelete.id),
        admins: arrayRemove(memberToDelete.id)
      });
      toast.error(`${memberToDelete.name} a fost eliminat.`);
      setMemberToDelete(null);
    } catch (error) {
      toast.error("Eroare la eliminare.");
    }
  };

  if (authLoading || loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen transition-all">
      {/* Header Sticky */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-6 py-4 flex items-center border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
        <div className="ml-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tighter leading-none">Gestionează Membri</h1>
          <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 uppercase tracking-widest">{trip?.name}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6 py-8">
        {/* Banner Invitatie */}
        {isOwner && (
          <div className="bg-blue-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-600/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-black uppercase tracking-tight">Invită Prieteni</h2>
              <p className="text-blue-100 text-xs font-medium opacity-80">Link-ul tău de acces rapid în grup.</p>
            </div>
            <button onClick={() => setShowLinkModal(true)} className="relative z-10 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">
               Copiază Link
            </button>
            <Users2 className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10 rotate-12" />
          </div>
        )}

        {/* Lista de Membri */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4">Participanți în grup</h2>
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            {members.map((member) => (
              <div key={member.id} className="p-5 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden ${
                    member.role === 'owner' ? 'bg-amber-100 text-amber-700' : member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {member.photoURL ? <img src={member.photoURL} className="w-full h-full object-cover" alt={member.name} /> : member.initials}
                  </div>
                  
                  <div className="text-left">
                    <p className="font-bold text-gray-900 dark:text-white text-[15px] tracking-tight">
                        {member.name} {member.role === 'owner' && "👑"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        member.role === 'owner' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : member.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {member.role === 'owner' || member.role === 'admin' ? 'Administrator Călătorie' : 'Membru'}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold truncate max-w-[100px] md:max-w-none">{member.email}</span>
                    </div>
                  </div>
                </div>

                {isOwner && member.id !== currentUserId && (
                  <div className="flex items-center">
                    <button 
                      onClick={() => setMemberToEdit(member)} 
                      className="p-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setMemberToDelete(member)} 
                      className="p-3 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL LINK INVITAȚIE */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 w-full max-w-sm border border-gray-100 dark:border-gray-800 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <LinkIcon className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-tighter">Link Invitație</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 font-medium">Oricine are acest link se poate alătura aventurii tale.</p>
              
              <div className="w-full bg-gray-50 dark:bg-gray-800/50 p-5 rounded-2xl mb-8 break-all text-[11px] font-bold text-gray-600 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-700">
                {inviteLink}
              </div>

              <div className="flex flex-col w-full gap-3">
                <button onClick={() => { navigator.clipboard.writeText(inviteLink); toast.success("Link copiat!"); setShowLinkModal(false); }} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                  <Copy className="w-4 h-4 inline mr-2" /> Copiază Link
                </button>
                <button onClick={() => setShowLinkModal(false)} className="w-full py-4 text-gray-400 dark:text-gray-500 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors">Închide</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITARE ROL */}
      {memberToEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] w-full max-w-sm p-8 border dark:border-gray-800 shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-tighter text-center">Gestionare Drepturi</h3>
            <p className="text-gray-500 text-sm mb-8 text-center font-medium leading-relaxed">
                {memberToEdit.role === 'admin' 
                    ? `Vrei să retragi rolul de administrator pentru ${memberToEdit.name}?` 
                    : `Vrei să îi oferi drepturi de administrator lui ${memberToEdit.name}?`}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleChangeRole(memberToEdit.id, memberToEdit.role)}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
              >
                {memberToEdit.role === 'admin' ? "Revocă Administrator" : "Confirmă Administrator"}
              </button>
              <button onClick={() => setMemberToEdit(null)} className="w-full py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest">Anulează</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ȘTERGERE MEMBRU */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-[110]">
          <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-8 w-full max-w-xs text-center shadow-2xl border dark:border-gray-800 animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserMinus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-tighter">Elimini membrul?</h3>
            <p className="text-gray-500 text-sm mb-8 font-medium text-center">Această acțiune îl va scoate pe {memberToDelete.name} din grupul călătoriei.</p>
            <div className="flex flex-col gap-2">
              <button onClick={confirmDelete} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-600/20 active:scale-95 transition-all">Elimină</button>
              <button onClick={() => setMemberToDelete(null)} className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl font-bold">Închide</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}