import { Outlet } from "react-router";
import { Navigation } from "./components/Navigation";

export function Root() {
  return (
    <div>
      <Navigation />
      <main>
        <Outlet /> {/* AICI se vor randa Home, Profile, Dashboard etc. */}
      </main>
    </div>
  );
}