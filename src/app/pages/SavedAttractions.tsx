import { useNavigate, Link } from "react-router";
import { ArrowLeft, MapPin, Star, Heart, Loader2, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState, useEffect } from "react";
import { db, auth } from "../../firebase";
import { doc, onSnapshot, updateDoc, arrayRemove, collection, query, where, limit, getDocs } from "firebase/firestore";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";

export function SavedAttractions() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) navigate("/");
      else {
        setAuthLoading(false);
        const userRef = doc(db, "users", user.uid);
        onSnapshot(userRef, async (snap) => {
          const ids = snap.data()?.savedAttractions || [];
          if (ids.length === 0) { setSaved([]); setLoading(false); return; }
          
          const API_KEY = "6627c045fcd14d76b5b547c8f3c54d17";
          const promises = ids.map(async (id: string) => {
            const res = await fetch(`https://api.geoapify.com/v2/place-details?id=${id}&apiKey=${API_KEY}`);
            const data = await res.json();
            const p = data.features[0].properties;
            return {
              id, name: p.name, city: p.city, 
              image: `https://tse1.mm.bing.net/th?q=${encodeURIComponent(p.name)}&w=600&h=400&c=1&p=0`,
              rating: (4 + Math.random()).toFixed(1)
            };
          });
          const results = await Promise.all(promises);
          setSaved(results);
          setLoading(false);
        });
      }
    });
    return () => unsubAuth();
  }, [navigate]);

  if (authLoading || loading) return <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="bg-gray-50 dark:bg-gray-950 min-h-screen p-6 transition-all">
      <div className="max-w-6xl mx-auto py-12">
        <div className="flex items-center gap-4 mb-12">
           <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800 hover:text-blue-600 transition-all"><ArrowLeft/></button>
           <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Locații Favorite</h1>
        </div>

        {saved.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl">
             <Heart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
             <p className="text-gray-500 font-black uppercase text-xs tracking-widest">Nicio locație salvată încă.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {saved.map((item) => (
              <div key={item.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                <div className="h-56 relative overflow-hidden flex">
                   <ImageWithFallback src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                   <button onClick={async () => await updateDoc(doc(db, "users", auth.currentUser!.uid), { savedAttractions: arrayRemove(item.id) })} className="absolute top-5 right-5 p-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-xl text-red-500 hover:scale-125 transition-all"><Heart className="fill-current"/></button>
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 truncate uppercase tracking-tight">{item.name}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-blue-600 font-bold text-xs"><MapPin className="w-3.5 h-3.5 mr-1" /> {item.city}</div>
                    <div className="flex items-center text-yellow-500 font-black text-xs"><Star className="w-3.5 h-3.5 mr-1 fill-current" /> {item.rating}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}