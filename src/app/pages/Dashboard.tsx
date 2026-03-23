import { Link } from "react-router";
import { Plus, Users, Calendar, MapPin, TrendingUp } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

interface Trip {
  id: string;
  name: string;
  destination: string;
  dates: string;
  members: number;
  image: string;
  status: "planning" | "voting" | "confirmed";
  votes: number;
  attractions: number;
}

const mockTrips: Trip[] = [
  {
    id: "1",
    name: "Paris Adventure",
    destination: "Paris, Franța",
    dates: "15-22 Iunie 2026",
    members: 6,
    image:
      "https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzJTIwZnJhbmNlfGVufDF8fHx8MTc3NDE5MDc4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "voting",
    votes: 24,
    attractions: 15,
  },
  {
    id: "2",
    name: "Summer in Greece",
    destination: "Santorini, Grecia",
    dates: "1-10 August 2026",
    members: 4,
    image:
      "https://images.unsplash.com/photo-1656504862966-2f0d002bae4c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW50b3JpbmklMjBncmVlY2UlMjBzdW5zZXR8ZW58MXx8fHwxNzc0MjUzNDAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "planning",
    votes: 12,
    attractions: 8,
  },
  {
    id: "3",
    name: "Rome Explorer",
    destination: "Roma, Italia",
    dates: "5-12 Septembrie 2026",
    members: 5,
    image:
      "https://images.unsplash.com/photo-1698103182362-51abdc45d008?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21lJTIwY29sb3NzZXVtJTIwaXRhbHl8ZW58MXx8fHwxNzc0MTc5NjQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    status: "confirmed",
    votes: 30,
    attractions: 20,
  },
];

export function Dashboard() {
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [newTripName, setNewTripName] = useState("");
  const [newTripDestination, setNewTripDestination] = useState("");

  const getStatusBadge = (status: Trip["status"]) => {
    switch (status) {
      case "planning":
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            Planificare
          </span>
        );
      case "voting":
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
            Votare
          </span>
        );
      case "confirmed":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            Confirmat
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl mb-2 text-gray-900">
            Călătoriile mele
          </h1>
          <p className="text-gray-600">
            Gestionează și planifică toate aventurile tale
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Total călătorii</div>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl text-gray-900">{mockTrips.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Membri totali</div>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl text-gray-900">
              {mockTrips.reduce((acc, trip) => acc + trip.members, 0)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Destinații</div>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl text-gray-900">{mockTrips.length}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Voturi active</div>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl text-gray-900">
              {mockTrips.reduce((acc, trip) => acc + trip.votes, 0)}
            </div>
          </div>
        </div>

        {/* New Trip Button */}
        <button
          onClick={() => setShowNewTripModal(true)}
          className="w-full sm:w-auto mb-8 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Creează călătorie nouă
        </button>

        {/* Trips Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTrips.map((trip) => (
            <Link
              key={trip.id}
              to={`/trip/${trip.id}`}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={trip.image}
                  alt={trip.destination}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4">
                  {getStatusBadge(trip.status)}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                  {trip.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {trip.destination}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {trip.dates}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {trip.members} membri
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                  <div className="text-gray-600">
                    {trip.attractions} atracții
                  </div>
                  <div className="text-blue-600">
                    {trip.votes} voturi
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {mockTrips.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl mb-2 text-gray-900">
                Nicio călătorie încă
              </h3>
              <p className="text-gray-600 mb-6">
                Începe să planifici prima ta aventură cu prietenii
              </p>
              <button
                onClick={() => setShowNewTripModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Creează prima călătorie
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Trip Modal */}
      {showNewTripModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl mb-4 text-gray-900">
              Creează călătorie nouă
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Numele călătoriei
                </label>
                <input
                  type="text"
                  value={newTripName}
                  onChange={(e) => setNewTripName(e.target.value)}
                  placeholder="ex: Barcelona Adventure"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm mb-2 text-gray-700">
                  Destinația
                </label>
                <input
                  type="text"
                  value={newTripDestination}
                  onChange={(e) => setNewTripDestination(e.target.value)}
                  placeholder="ex: Barcelona, Spania"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewTripModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Anulează
              </button>
              <Link
                to="/trip/4"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Creează
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
