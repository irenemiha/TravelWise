import { createBrowserRouter } from "react-router";
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminTrips } from './pages/AdminTrips';
import { Home } from "./pages/Home";
import { Dashboard } from "./pages/Dashboard";
import { TripPlanning } from "./pages/TripPlanning";
import { Explore } from "./pages/Explore";
import { Itinerary } from "./pages/Itinerary";
import { Profile } from "./pages/Profile";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { NewTrip } from "./pages/NewTrip";
import { ChangeDestination } from "./pages/ChangeDestination";
import { NotificationDropdown } from "./components/NotificationDropdown";
import { EditProfile } from "./pages/EditProfile";
import { HideItinerary } from "./pages/HideItinerary";
import { InvitationPermissions } from "./pages/InvitationPermission";
import { LockItinerary } from "./pages/LockItinerary";
import { Settings } from "./pages/Settings";
import { PrivacySettings } from "./pages/PrivacySettings";
import { ManageMembers } from "./pages/ManageMembers";
import { SavedAttractions } from "./pages/SavedAttractions";
import { TripSettings } from "./pages/TripSettings";
import { VoteNotifications } from "./pages/VoteNotifications";
import { TripChat } from "./pages/TripChat";

import { Root } from "./Root";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "/admin-dashboard", Component: AdminDashboard },
      { path: "/admin-users", Component: AdminUsers },
      { path: "/admin-trips", Component: AdminTrips },
      { path: "dashboard", Component: Dashboard },
      { path: "trip/:id", Component: TripPlanning },
      { path: "explore/:id", Component: Explore },
      { path: "itinerary/:id", Component: Itinerary },
      { path: "profile", Component: Profile },
      { path: "login", Component: Login },
      { path: "signup", Component: Signup },
      { path: "new-trip", Component: NewTrip },
      { path: "change-destination/:id", Component: ChangeDestination },
      { path: "edit-profile", Component: EditProfile },
      { path: "hide-itinerary/:id", Component: HideItinerary },
      { path: "invitation-permissions/:id", Component: InvitationPermissions },
      { path: "notifications", Component: NotificationDropdown },
      { path: "lock-itinerary/:id", Component: LockItinerary },
      { path: "settings", Component: Settings },
      { path: "privacy-settings/:id", Component: PrivacySettings },
      { path: "manage-members/:id", Component: ManageMembers },
      { path: "saved-attractions", Component: SavedAttractions },
      { path: "trip-settings/:id", Component: TripSettings },
      { path: "vote-notifications/:id", Component: VoteNotifications },
      { path: "trip-chat/:id", Component: TripChat },
    ],
  },
]);
