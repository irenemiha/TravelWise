import { useParams, Link } from "react-router";
import {
  Users,
  UserPlus,
  MapPin,
  Calendar,
  Share2,
  Settings,
  ArrowRight,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: "admin" | "member";
}

const mockMembers: Member[] = [
  { id: "1", name: "Ana Almajanu", avatar: "", role: "admin" },
  { id: "2", name: "Alexandra Burnichi", avatar: "", role: "member" },
  { id: "3", name: "Luciana Mosila", avatar: "", role: "member" },
  { id: "4", name: "Irene Musat", avatar: "", role: "member" },
  { id: "5", name: "Anna-Mariia Peduraru", avatar: "", role: "member" },
  { id: "6", name: "Ilinca-Ioana Strutu", avatar: "", role: "member" },
];

export function TripPlanning() {
  const { id } = useParams();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-green-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 opacity-40">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzJTIwZnJhbmNlfGVufDF8fHx8MTc3NDE5MDc4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Paris"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="text-white">
              <h1 className="text-3xl sm:text-4xl mb-2">Paris Adventure</h1>
              <div className="flex flex-wrap gap-4 text-blue-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Paris, Franța
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  15-22 Iunie 2026
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {mockMembers.length} membri
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Distribuie</span>
              </button>
              <button className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors backdrop-blur-sm">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200">
            <button className="px-6 py-4 border-b-2 border-blue-600 text-blue-600 whitespace-nowrap">
              Prezentare generală
            </button>
            <Link
              to={`/explore/${id}`}
              className="px-6 py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 whitespace-nowrap"
            >
              Explorează atracții
            </Link>
            <Link
              to={`/itinerary/${id}`}
              className="px-6 py-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900 whitespace-nowrap"
            >
              Itinerariu
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl mb-4 text-gray-900">Acțiuni rapide</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to={`/explore/${id}`}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition-colors group"
                >
                  <MapPin className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="mb-1 text-gray-900">Explorează atracții</h3>
                  <p className="text-sm text-gray-600">
                    Descoperă obiective turistice
                  </p>
                </Link>
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-colors text-left group">
                  <Users className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="mb-1 text-gray-900">Votează atracții</h3>
                  <p className="text-sm text-gray-600">
                    Alege preferatele tale
                  </p>
                </button>
                <Link
                  to={`/itinerary/${id}`}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition-colors group"
                >
                  <Calendar className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="mb-1 text-gray-900">Vezi itinerarul</h3>
                  <p className="text-sm text-gray-600">
                    Planul generat automat
                  </p>
                </Link>
                <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-600 hover:bg-orange-50 transition-colors text-left group">
                  <Share2 className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="mb-1 text-gray-900">Distribuie</h3>
                  <p className="text-sm text-gray-600">
                    Invită mai mulți prieteni
                  </p>
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl mb-4 text-gray-900">Progres planificare</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Atracții adăugate
                    </span>
                    <span className="text-sm text-gray-900">15/20</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: "75%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Membri au votat
                    </span>
                    <span className="text-sm text-gray-900">4/6</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full"
                      style={{ width: "66%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      Itinerariu complet
                    </span>
                    <span className="text-sm text-gray-900">60%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: "60%" }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl mb-4 text-gray-900">Activitate recentă</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                    AB
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span>Alexandra Burnichi</span> a votat pentru{" "}
                      <span className="text-blue-600">Turnul Eiffel</span>
                    </p>
                    <p className="text-sm text-gray-500">Acum 2 ore</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white flex-shrink-0">
                    LM
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span>Luciana Mosila</span> a adăugat{" "}
                      <span className="text-blue-600">Muzeul Luvru</span>
                    </p>
                    <p className="text-sm text-gray-500">Acum 5 ore</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white flex-shrink-0">
                    IM
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span>Irene Musat</span> a votat pentru{" "}
                      <span className="text-blue-600">Arc de Triomphe</span>
                    </p>
                    <p className="text-sm text-gray-500">Ieri</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Members */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-gray-900">Membri</h2>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <UserPlus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                {mockMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${getAvatarColor(
                        index
                      )} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 truncate">{member.name}</p>
                      {member.role === "admin" && (
                        <p className="text-xs text-blue-600">Administrator</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-sm p-6 text-white">
              <h2 className="text-xl mb-4">Următorii pași</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-blue-50">
                    Explorează și adaugă mai multe atracții
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-blue-50">
                    Așteaptă ca toți membrii să voteze
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <p className="text-blue-50">
                    Generează itinerarul final
                  </p>
                </div>
              </div>
              <Link
                to={`/explore/${id}`}
                className="mt-4 block w-full bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-center flex items-center justify-center gap-2"
              >
                Continuă planificarea
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl mb-4 text-gray-900">Invită membri</h2>
            <p className="text-gray-600 mb-4">
              Distribuie acest link cu prietenii tăi:
            </p>
            <div className="bg-gray-100 p-3 rounded-lg mb-4 break-all text-sm text-gray-700">
              https://travelwise.app/join/paris-adventure-xyz123
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Închide
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Copiază link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
