import { Link, useLocation, useNavigate } from "react-router";
import { 
  Plane, 
  Menu, 
  X, 
  User, 
  LogIn, 
  UserPlus, 
  PlusCircle, 
  LayoutDashboard,
  LogOut,
  Home as HomeIcon,
  ChevronDown
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { auth } from "../../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { NotificationDropdown } from "./NotificationDropdown";

export function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsDropdownOpen(false);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 p-2 rounded-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-600/20">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tighter">
              Travel<span className="text-blue-600">Wise</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 mr-4">
              <Link 
                to="/" 
                className={`px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all ${
                  isActive("/") 
                    ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                    : "text-gray-500 dark:text-gray-400 hover:text-blue-600"
                }`}
              >
                Acasă
              </Link>
              
              {user && (
                <Link 
                  to="/dashboard" 
                  className={`px-4 py-2 text-[11px] font-black uppercase tracking-[0.15em] rounded-xl transition-all flex items-center gap-2 ${
                    isActive("/dashboard") 
                      ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" 
                      : "text-gray-500 dark:text-gray-400 hover:text-blue-600"
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Călătorii
                </Link>
              )}
            </div>

            {user && (
              /* BUTON CĂLĂTORIE NOUĂ - STIL CTA */
              <Link 
                to="/new-trip" 
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 transition-all active:scale-95 shadow-lg shadow-blue-600/20 mr-4"
              >
                <PlusCircle className="w-4 h-4" />
                Călătorie nouă
              </Link>
            )}

            {/* SECȚIUNE DREAPTA (Notificări + Profil) */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-100 dark:border-gray-800">
              {user && <NotificationDropdown />}

              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* DROPDOWN MENU */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[1.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {!user ? (
                      <div className="p-2 flex flex-col gap-1">
                        <Link 
                          to="/login" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          <LogIn className="w-4 h-4 text-blue-600" /> Login
                        </Link>
                        <Link 
                          to="/signup" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          <UserPlus className="w-4 h-4 text-blue-600" /> Creează Cont
                        </Link>
                      </div>
                    ) : (
                      <div className="p-2 flex flex-col gap-1">
                        <div className="px-4 py-3 mb-1">
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Conectat ca</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{user.email}</p>
                        </div>
                        <div className="h-[1px] bg-gray-50 dark:bg-gray-800 mx-2 mb-1" />
                        <Link 
                          to="/profile" 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-xs font-black uppercase tracking-widest text-gray-700 dark:text-gray-200 transition-colors"
                        >
                          <User className="w-4 h-4 text-blue-600" /> Profilul meu
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="flex items-center gap-3 p-3 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-xs font-black uppercase tracking-widest text-red-600 w-full text-left transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Ieși din cont
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center gap-3">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 p-4 space-y-3 animate-in slide-in-from-top-4 duration-300">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 font-black text-xs uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-all">
            <HomeIcon className="w-5 h-5 text-blue-600" /> Acasă
          </Link>
          
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 font-black text-xs uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-all">
                <LayoutDashboard className="w-5 h-5 text-blue-600" /> Călătoriile mele
              </Link>
              
              {/* MOBILE CTA */}
              <Link to="/new-trip" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 font-black text-xs uppercase tracking-widest bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20">
                <PlusCircle className="w-5 h-5" /> Călătorie nouă
              </Link>

              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 font-black text-xs uppercase tracking-widest text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-2xl transition-all">
                <User className="w-5 h-5 text-blue-600" /> Profilul meu
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-4 p-4 font-black text-xs uppercase tracking-widest text-red-600 w-full text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all">
                <LogOut className="w-5 h-5" /> Ieși din cont
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-4 font-black text-[10px] uppercase tracking-widest bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl transition-all">
                Login
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 p-4 font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-600/20 transition-all">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}