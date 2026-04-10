import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, Send, Image as ImageIcon, Loader2, Users } from "lucide-react";
import { db, auth } from "../../firebase";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, doc } from "firebase/firestore";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { onAuthStateChanged } from "firebase/auth";

export function TripChat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => { if (!user) navigate("/"); });
    if (!id) return;
    onSnapshot(doc(db, "trips", id), (snap) => setTrip(snap.data()));
    const unsubMsgs = onSnapshot(query(collection(db, "trips", id, "messages"), orderBy("timestamp", "asc")), (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubMsgs();
  }, [id, navigate]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const text = newMessage; setNewMessage("");
    await addDoc(collection(db, "trips", id!, "messages"), {
      text, senderId: auth.currentUser?.uid, senderName: auth.currentUser?.displayName || "Călător", timestamp: serverTimestamp()
    });
  };

  if (loading) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-gray-950 transition-all">
      {/* Mini Header Chat */}
      <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><ArrowLeft/></button>
          <div>
            <h1 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter">{trip?.name}</h1>
            <div className="flex items-center text-[10px] text-gray-400 font-black uppercase tracking-widest"><Users className="w-3 h-3 mr-1"/> {trip?.participants?.length} Membri</div>
          </div>
        </div>
      </div>

      {/* Mesaje */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.map((m) => {
          const isMe = m.senderId === auth.currentUser?.uid;
          return (
            <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-2">{m.senderName}</span>
              <div className={`max-w-md p-4 rounded-2xl shadow-sm font-medium ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none'}`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-4">
          <input 
            type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajul tău..." 
            className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-600 dark:text-white font-bold transition-all"
          />
          <button type="submit" className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all"><Send/></button>
        </form>
      </div>
    </div>
  );
}