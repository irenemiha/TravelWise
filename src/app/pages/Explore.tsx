import { useParams, Link } from "react-router";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  ThumbsUp,
  ThumbsDown,
  Search,
  Filter,
  Heart,
  Info,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

interface Attraction {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  duration: string;
  price: string;
  category: string;
  votes: { up: number; down: number };
  userVote: "up" | "down" | null;
  saved: boolean;
}

const mockAttractions: Attraction[] = [
  {
    id: "1",
    name: "Turnul Eiffel",
    description:
      "Simbolul iconic al Parisului, oferă vederi spectaculoase asupra orașului",
    image:
      "https://images.unsplash.com/photo-1642947392578-b37fbd9a4d45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlaWZmZWwlMjB0b3dlciUyMHBhcmlzJTIwZnJhbmNlfGVufDF8fHx8MTc3NDE5MDc4NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.8,
    reviews: 25420,
    duration: "2-3 ore",
    price: "€26",
    category: "Monumente",
    votes: { up: 5, down: 1 },
    userVote: "up",
    saved: true,
  },
  {
    id: "2",
    name: "Muzeul Luvru",
    description:
      "Cel mai mare muzeu de artă din lume, cu colecții de neprețuit",
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb3V2cmUlMjBtdXNldW18ZW58MXx8fHwxNzc0MjcyNDc4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    reviews: 18950,
    duration: "3-4 ore",
    price: "€17",
    category: "Muzee",
    votes: { up: 4, down: 0 },
    userVote: "up",
    saved: true,
  },
  {
    id: "3",
    name: "Arc de Triomphe",
    description: "Monument istoric dedicat armatelor franceze",
    image:
      "https://images.unsplash.com/photo-1549144511-f099e773c147?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcmMlMjBkZSUyMHRyaW9tcGhlfGVufDF8fHx8MTc3NDI3MjQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.6,
    reviews: 12300,
    duration: "1-2 ore",
    price: "€13",
    category: "Monumente",
    votes: { up: 3, down: 1 },
    userVote: null,
    saved: false,
  },
  {
    id: "4",
    name: "Catedrala Notre-Dame",
    description: "Capodoperă gotică în inima Parisului",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxub3RyZSUyMGRhbWUlMjBwYXJpc3xlbnwxfHx8fDE3NzQyNzI0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    reviews: 15600,
    duration: "1-2 ore",
    price: "Gratuit",
    category: "Monumente",
    votes: { up: 4, down: 0 },
    userVote: null,
    saved: false,
  },
  {
    id: "5",
    name: "Sacré-Cœur",
    description: "Bazilică albă impresionantă pe dealul Montmartre",
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxzYWNyZSUyMGNvZXVyfGVufDF8fHx8MTc3NDI3MjQ3OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.7,
    reviews: 9800,
    duration: "1-2 ore",
    price: "Gratuit",
    category: "Religios",
    votes: { up: 2, down: 0 },
    userVote: null,
    saved: false,
  },
  {
    id: "6",
    name: "Grădinile Versailles",
    description: "Grădini regale magnifice cu fântâni și sculpturi",
    image:
      "https://images.unsplash.com/photo-1580655653885-65763b2597d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXJzYWlsbGVzJTIwZ2FyZGVuc3xlbnwxfHx8fDE3NzQyNzI0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    rating: 4.9,
    reviews: 8500,
    duration: "3-5 ore",
    price: "€20",
    category: "Parcuri",
    votes: { up: 3, down: 1 },
    userVote: null,
    saved: false,
  },
];

export function Explore() {
  const { id } = useParams();
  const [attractions, setAttractions] = useState(mockAttractions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleVote = (attractionId: string, voteType: "up" | "down") => {
    setAttractions((prev) =>
      prev.map((attr) => {
        if (attr.id === attractionId) {
          const newVotes = { ...attr.votes };
          const oldVote = attr.userVote;

          // Remove old vote if exists
          if (oldVote === "up") newVotes.up--;
          if (oldVote === "down") newVotes.down--;

          // Add new vote if different from old
          const newVote = oldVote === voteType ? null : voteType;
          if (newVote === "up") newVotes.up++;
          if (newVote === "down") newVotes.down++;

          return { ...attr, votes: newVotes, userVote: newVote };
        }
        return attr;
      })
    );
  };

  const toggleSave = (attractionId: string) => {
    setAttractions((prev) =>
      prev.map((attr) =>
        attr.id === attractionId ? { ...attr, saved: !attr.saved } : attr
      )
    );
  };

  const categories = [
    "all",
    ...Array.from(new Set(mockAttractions.map((a) => a.category))),
  ];

  const filteredAttractions = attractions.filter((attr) => {
    const matchesSearch =
      attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attr.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || attr.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl mb-1 text-gray-900">
                Explorează Paris
              </h1>
              <p className="text-gray-600">
                Descoperă și votează atracțiile preferate
              </p>
            </div>
            <Link
              to={`/trip/${id}`}
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              ← Înapoi la călătorie
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Caută atracții..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`font-bold px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {category === "all" ? "Toate" : category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Stats Bar */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl text-blue-600">
                  {attractions.filter((a) => a.saved).length}
                </div>
                <div className="text-sm text-gray-600">Atracții salvate</div>
              </div>
              <div>
                <div className="text-2xl text-blue-600">
                  {attractions.reduce((acc, a) => acc + a.votes.up, 0)}
                </div>
                <div className="text-sm text-gray-600">Voturi totale</div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredAttractions.length} rezultate
            </div>
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attraction) => (
            <div
              key={attraction.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48">
                <ImageWithFallback
                  src={attraction.image}
                  alt={attraction.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => toggleSave(attraction.id)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      attraction.saved
                        ? "fill-red-500 text-red-500"
                        : "text-gray-600"
                    }`}
                  />
                </button>
                <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {attraction.category}
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-xl mb-2 text-gray-900">
                  {attraction.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {attraction.description}
                </p>

                {/* Rating and Details */}
                <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {attraction.rating} ({attraction.reviews.toLocaleString()}
                      )
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{attraction.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{attraction.price}</span>
                  </div>
                </div>

                {/* Voting Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVote(attraction.id, "up")}
                        className={`font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                          attraction.userVote === "up"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600 hover:bg-green-50"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{attraction.votes.up}</span>
                      </button>
                      <button
                        onClick={() => handleVote(attraction.id, "down")}
                        className={`font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                          attraction.userVote === "down"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600 hover:bg-red-50"
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>{attraction.votes.down}</span>
                      </button>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Info className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAttractions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-900">
              Nicio atracție găsită
            </h3>
            <p className="text-gray-600">
              Încearcă să modifici filtrele sau termenii de căutare
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
