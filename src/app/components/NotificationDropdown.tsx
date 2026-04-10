import { useState, useEffect, useRef } from "react";
import { Bell, Mail, Vote, MessageSquare, Trash2, X, Circle } from "lucide-react";
import { db, auth } from "../../firebase";
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc, updateDoc, limit } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { ro } from "date-fns/locale";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "invite" | "vote" | "chat";
  createdAt: any;
  read: boolean;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. DACĂ NU EXISTĂ USER, NU PORNI ASCULTAREA SAU OPREȘTE-O PE CEA EXISTENTĂ
    if (!auth.currentUser) {
      setNotifications([]);
      return;
    }

    const currentUserId = auth.currentUser.uid;

    const q = query(
      collection(db, "users", currentUserId, "notifications"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    // 2. ADĂUGĂM LOGICĂ DE CATCH PENTRU ERORI DE PERMISIUNI LA LOGOUT
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      setNotifications(data);
    }, (error) => {
      // Ignorăm erorile de tip 'permission-denied' care se întâmplă în milisecunda în care userul dă logout
      if (error.code !== 'permission-denied') {
        console.error("Notif fetch error:", error);
      }
    });

    return () => unsubscribe();
  }, [auth.currentUser]); // Re-executăm când starea auth se schimbă

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    if (!auth.currentUser) return;
    try {
        const notifRef = doc(db, "users", auth.currentUser.uid, "notifications", id);
        await updateDoc(notifRef, { read: true });
    } catch (e) {
        console.error(e);
    }
  };

  const deleteNotif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!auth.currentUser) return;
    try {
        await deleteDoc(doc(db, "users", auth.currentUser.uid, "notifications", id));
    } catch (e) {
        console.error(e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "invite": return <Mail className="w-4 h-4 text-blue-500" />;
      case "vote": return <Vote className="w-4 h-4 text-purple-500" />;
      case "chat": return <MessageSquare className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-all relative"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
            <h3 className="font-black text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">Notificări</h3>
            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
              {unreadCount} NOI
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Nu ai nicio notificare</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  className={`p-4 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors cursor-pointer relative group ${!n.read ? 'bg-blue-50/30 dark:bg-blue-900/5' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1">{getIcon(n.type)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-0.5">{n.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-gray-400 font-medium mt-2 block">
                        {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: ro }) : "recent"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2">
                       {!n.read && <Circle className="w-2 h-2 fill-blue-500 text-blue-500" />}
                       <button 
                        onClick={(e) => deleteNotif(e, n.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-500 transition-all"
                       >
                        <Trash2 className="w-3.5 h-3.5" />
                       </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <button className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              Vezi toate activitățile
            </button>
          )}
        </div>
      )}
    </div>
  );
}