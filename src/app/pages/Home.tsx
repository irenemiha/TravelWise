import { Link } from "react-router";
import {
  Users,
  Vote,
  MapPin,
  Calendar,
  CheckCircle,
  ArrowRight,
  Plane,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Full background image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1760638260845-5d9cb690829b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmllbmRzJTIwdHJhdmVsJTIwYmVhdXRpZnVsJTIwZGVzdGluYXRpb24lMjBzdW1tZXJ8ZW58MXx8fHwxNzc0MjczMDgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Friends travel beautiful destination summer"
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-20 pb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Platforma ta de planificare colabrativă
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-lg">
              Planifică călătorii <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">
                perfecte în grup
              </span>
            </h1>
            
            <p className="text-lg sm:text-2xl text-gray-200 mb-10 drop-shadow-md font-light leading-relaxed">
              Votează destinații, creează itinerarii și ia decizii împreună cu
              prietenii tăi - totul într-un singur loc, fără stres.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 transition-all gap-2"
              >
                Începe gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold rounded-xl text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all shadow-xl"
              >
                Cum funcționează
              </a>
            </div>

            <div className="mt-12 flex items-center gap-4 text-sm text-gray-200 font-medium drop-shadow-md">
              <div className="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces" alt="User 1" className="w-10 h-10 rounded-full border-2 border-gray-800 object-cover" />
                <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces" alt="User 2" className="w-10 h-10 rounded-full border-2 border-gray-800 object-cover" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces" alt="User 3" className="w-10 h-10 rounded-full border-2 border-gray-800 object-cover" />
                <div className="w-10 h-10 rounded-full border-2 border-gray-800 bg-blue-600 flex items-center justify-center text-xs text-white font-bold">+2k</div>
              </div>
              <span className="text-base">grupuri au planificat deja</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl mb-4 text-gray-900">
              Îți sună cunoscut?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Planificarea unei vacanțe în grup poate fi complicată și
              frustrантă
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-red-50 p-6 rounded-xl">
              <div className="text-red-600 mb-4">❌</div>
              <h3 className="text-xl mb-2 text-gray-900">
                Prea multe mesaje
              </h3>
              <p className="text-gray-600">
                Discuții nesfârșite pe WhatsApp sau Messenger pentru a decide
                ce să vizitați
              </p>
            </div>
            <div className="bg-red-50 p-6 rounded-xl">
              <div className="text-red-600 mb-4">❌</div>
              <h3 className="text-xl mb-2 text-gray-900">
                Preferințe diferite
              </h3>
              <p className="text-gray-600">
                Fiecare are idei diferite și e greu să găsiți un compromis
              </p>
            </div>
            <div className="bg-red-50 p-6 rounded-xl">
              <div className="text-red-600 mb-4">❌</div>
              <h3 className="text-xl mb-2 text-gray-900">
                Informații împrăștiate
              </h3>
              <p className="text-gray-600">
                Folosiți 5+ aplicații diferite pentru a planifica o singură
                călătorie
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl mb-4 text-gray-900">
              Cum funcționează TravelWise
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Un proces simplu în 4 pași pentru călătoria perfectă
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-sm text-blue-600 mb-2">PASUL 1</div>
              <h3 className="text-xl mb-2 text-gray-900">
                Creează grupul
              </h3>
              <p className="text-gray-600">
                Invită prietenii în grupul tău de călătorie
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-sm text-purple-600 mb-2">PASUL 2</div>
              <h3 className="text-xl mb-2 text-gray-900">
                Explorează atracțiile
              </h3>
              <p className="text-gray-600">
                Descoperă obiective turistice și activități
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Vote className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm text-green-600 mb-2">PASUL 3</div>
              <h3 className="text-xl mb-2 text-gray-900">
                Votează împreună
              </h3>
              <p className="text-gray-600">
                Toți membrii votează atracțiile preferate
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-sm text-orange-600 mb-2">PASUL 4</div>
              <h3 className="text-xl mb-2 text-gray-900">
                Generează itinerarul
              </h3>
              <p className="text-gray-600">
                Sistemul creează automat itinerarul perfect
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl mb-6 text-gray-900">
                De ce să alegi TravelWise?
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl mb-1 text-gray-900">
                      Economisește timp
                    </h3>
                    <p className="text-gray-600">
                      Reduce timpul de planificare cu până la 70%
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl mb-1 text-gray-900">
                      Decizii democratice
                    </h3>
                    <p className="text-gray-600">
                      Fiecare are voce în planificarea călătoriei
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl mb-1 text-gray-900">
                      Tot într-un loc
                    </h3>
                    <p className="text-gray-600">
                      Nu mai trebuie să jonglezi între 10 aplicații diferite
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl mb-1 text-gray-900">
                      Experiență colaborativă
                    </h3>
                    <p className="text-gray-600">
                      Toată lumea participă activ la planificare
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1761653457994-f216b01302bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm91cCUyMHBlb3BsZSUyMHBsYW5uaW5nJTIwdHJpcHxlbnwxfHx8fDE3NzQyNzI0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Group planning"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl mb-6">
            Gata să planifici următoarea aventură?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Alătură-te miilor de grupuri care își planifică călătoriile cu
            TravelWise
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Creează prima ta călătorie
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-white">TravelWise</span>
              </div>
              <p className="text-sm">
                Planificarea călătoriilor în grup, simplificată.
              </p>
            </div>
            <div>
              <h4 className="text-white mb-4">Produs</h4>
              <div className="space-y-2 text-sm">
                <div>Funcționalități</div>
                <div>Prețuri</div>
                <div>Demo</div>
              </div>
            </div>
            <div>
              <h4 className="text-white mb-4">Companie</h4>
              <div className="space-y-2 text-sm">
                <div>Despre noi</div>
                <div>Echipa</div>
                <div>Contact</div>
              </div>
            </div>
            <div>
              <h4 className="text-white mb-4">Legal</h4>
              <div className="space-y-2 text-sm">
                <div>Termeni</div>
                <div>Confidențialitate</div>
                <div>Cookie-uri</div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            © 2026 TravelWise. Toate drepturile rezervate.
          </div>
        </div>
      </footer>
    </div>
  );
}
