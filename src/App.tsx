import { useSyncExternalStore } from "react"
import { WeatherProvider, WeatherBackground } from "./components/weather/Weather"
import Main from "./pages/main"
import MyBell from "./pages/my-bell"
import { BirthdayCelebration } from "./components/BirthdayCelebration"

function subscribePathname(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange)
  return () => window.removeEventListener("popstate", onStoreChange)
}

function getPathname() {
  return window.location.pathname.replace(/\/$/, "") || "/"
}

export default function App() {
  const pathname = useSyncExternalStore(subscribePathname, getPathname, () => "/")

  return (
    <WeatherProvider>
      <div className="weather-shell relative isolate min-h-screen bg-[#FAF5F7]">
        <WeatherBackground />
        <BirthdayCelebration />
        <div className="relative z-10">
          {pathname === "/my-bell" ? <MyBell /> : <Main />}
        </div>
      </div>
    </WeatherProvider>
  )
}
