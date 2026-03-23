import { createBrowserRouter } from "react-router";
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { TripPlanning } from "./pages/TripPlanning";
import { Explore } from "./pages/Explore";
import { Itinerary } from "./pages/Itinerary";
import { Root } from "./Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "dashboard", Component: Dashboard },
      { path: "trip/:id", Component: TripPlanning },
      { path: "explore/:id", Component: Explore },
      { path: "itinerary/:id", Component: Itinerary },
    ],
  },
]);
