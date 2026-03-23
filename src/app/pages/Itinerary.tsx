import { useParams, Link } from "react-router";
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Download,
  Share2,
  ChevronRight,
  Coffee,
  Utensils,
  Camera,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

interface ItineraryDay {
  date: string;
  day: number;
  activities: Activity[];
}

interface Activity {
  id: string;
  time: string;
  name: string;
  description: string;
  duration: string;
  price: string;
  image: string;
  type: "attraction" | "meal" | "transport" | "break";
  location: string;
}

const mockItinerary: ItineraryDay[] = [
  {
    date: "15 Iunie 2026",
    day: 1,
    activities: [
      {
        id: "1",
        time: "09:00",
        name: "Turnul Eiffel",
        description: "Vizită la simbolul iconic al Parisului",
        duration: "2.5 ore",
        price: "€26",
        image:
          "https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzJTIwZnJhbmNlfGVufDF8fHx8MTc3NDE5MDc4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "attraction",
        location: "Champ de Mars",
      },
      {
        id: "2",
        time: "12:00",
        name: "Prânz la Café de l'Homme",
        description: "Restaurant cu vedere spre Turnul Eiffel",
        duration: "1.5 ore",
        price: "€45",
        image:
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzc0MjcyNDc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "meal",
        location: "Trocadéro",
      },
      {
        id: "3",
        time: "14:30",
        name: "Muzeul Luvru",
        description: "Explorează colecțiile de artă celebre",
        duration: "3 ore",
        price: "€17",
        image:
          "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3V2cmUlMjBtdXNldW18ZW58MXx8fHwxNzc0MjcyNDc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "attraction",
        location: "Rue de Rivoli",
      },
      {
        id: "4",
        time: "18:00",
        name: "Pauză de cafea",
        description: "Relaxare la un café parizian autentic",
        duration: "1 oră",
        price: "€8",
        image:
          "https://images.unsplash.com/photo-1514933651103-005eec06c04b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGNhZmV8ZW58MXx8fHwxNzc0MjcyNDc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "break",
        location: "Le Marais",
      },
    ],
  },
  {
    date: "16 Iunie 2026",
    day: 2,
    activities: [
      {
        id: "5",
        time: "10:00",
        name: "Arc de Triomphe",
        description: "Monument istoric și vedere panoramică",
        duration: "1.5 ore",
        price: "€13",
        image:
          "https://images.unsplash.com/photo-1549144511-f099e773c147?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmMlMjBkZSUyMHRyaW9tcGhlfGVufDF8fHx8MTc3NDI3MjQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "attraction",
        location: "Place Charles de Gaulle",
      },
      {
        id: "6",
        time: "12:00",
        name: "Plimbare pe Champs-Élysées",
        description: "Shopping și sightseeing",
        duration: "2 ore",
        price: "€0",
        image:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGFtcHMlMjBlbHlzZWVzfGVufDF8fHx8MTc3NDI3MjQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "attraction",
        location: "Champs-Élysées",
      },
      {
        id: "7",
        time: "14:30",
        name: "Prânz tradițional francez",
        description: "Bucătărie franceză autentică",
        duration: "2 ore",
        price: "€55",
        image:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmb29kfGVufDF8fHx8MTc3NDI3MjQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "meal",
        location: "Saint-Germain-des-Prés",
      },
      {
        id: "8",
        time: "17:00",
        name: "Catedrala Notre-Dame",
        description: "Arhitectură gotică impresionantă",
        duration: "1.5 ore",
        price: "Gratuit",
        image:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3RyZSUyMGRhbWUlMjBwYXJpc3xlbnwxfHx8fDE3NzQyNzI0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "attraction",
        location: "Île de la Cité",
      },
    ],
  },
  {
    date: "17 Iunie 2026",
    day: 3,
    activities: [
      {
        id: "9",
        time: "09:30",
        name: "Sacré-Cœur",
        description: "Bazilică pe dealul Montmartre",
        duration: "2 ore",
        price: "Gratuit",
        image:
          "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxzYWNyZSUyMGNvZXVyfGVufDF8fHx8MTc3NDI3MjQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "attraction",
        location: "Montmartre",
      },
      {
        id: "10",
        time: "12:00",
        name: "Explorare Montmartre",
        description: "Cartier artistic cu străzi pitorești",
        duration: "2.5 ore",
        price: "€0",
        image:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb250bWFydHJlJTIwcGFyaXN8ZW58MXx8fHwxNzc0MjcyNDc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        type: "attraction",
        location: "Montmartre",
      },
    ],
  },
];

export function Itinerary() {
  const { id } = useParams();

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "meal":
        return <Utensils className="w-5 h-5" />;
      case "break":
        return <Coffee className="w-5 h-5" />;
      case "attraction":
        return <Camera className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "meal":
        return "bg-orange-100 text-orange-700";
      case "break":
        return "bg-purple-100 text-purple-700";
      case "attraction":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const totalCost = mockItinerary.reduce(
    (acc, day) =>
      acc +
      day.activities.reduce((dayAcc, activity) => {
        const price = activity.price.replace(/[€,]/g, "");
        return dayAcc + (price === "Gratuit" ? 0 : parseFloat(price) || 0);
      }, 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <Link
                to={`/trip/${id}`}
                className="text-blue-100 hover:text-white mb-2 inline-block"
              >
                ← Înapoi la călătorie
              </Link>
              <h1 className="text-3xl sm:text-4xl mb-2">
                Itinerariu Paris Adventure
              </h1>
              <p className="text-blue-100">
                Planul tău personalizat pentru 15-22 Iunie 2026
              </p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export PDF</span>
              </button>
              <button className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-opacity-30 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Distribuie</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Summary Cards */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Total zile</div>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl text-gray-900">
              {mockItinerary.length}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Total activități</div>
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-3xl text-gray-900">
              {mockItinerary.reduce((acc, day) => acc + day.activities.length, 0)}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-gray-600">Cost estimat</div>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl text-gray-900">
              €{totalCost.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              ~€{(totalCost / 6).toFixed(0)} / persoană
            </div>
          </div>
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-8">
          {mockItinerary.map((day, dayIndex) => (
            <div key={day.day} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Day Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-blue-100 mb-1">
                      Ziua {day.day}
                    </div>
                    <h2 className="text-2xl">{day.date}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-100">
                      {day.activities.length} activități
                    </div>
                    <div className="text-xl">
                      {day.activities[0].time} - {day.activities[day.activities.length - 1].time}
                    </div>
                  </div>
                </div>
              </div>

              {/* Activities */}
              <div className="p-6">
                <div className="space-y-6">
                  {day.activities.map((activity, activityIndex) => (
                    <div key={activity.id} className="relative">
                      {/* Timeline connector */}
                      {activityIndex < day.activities.length - 1 && (
                        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-gray-200 -mb-6" />
                      )}

                      <div className="flex gap-4">
                        {/* Time */}
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-full ${getActivityColor(
                              activity.type
                            )} flex items-center justify-center relative z-10`}
                          >
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="text-sm text-gray-600 mt-2 whitespace-nowrap">
                            {activity.time}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                              <ImageWithFallback
                                src={activity.image}
                                alt={activity.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg mb-1 text-gray-900">
                                {activity.name}
                              </h3>
                              <p className="text-sm text-gray-600 mb-3">
                                {activity.description}
                              </p>
                              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {activity.location}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {activity.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {activity.price}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Steps CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white mt-8 text-center">
          <h2 className="text-2xl sm:text-3xl mb-4">
            Itinerarul tău este gata!
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Acum poți descărca itinerarul, distribui cu grupul sau începe să
            faci rezervări pentru activitățile planificate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Descarcă itinerarul
            </button>
            <button className="bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-lg hover:bg-opacity-30 transition-colors flex items-center justify-center gap-2">
              Începe rezervările
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
