import { useSyncExternalStore } from "react"
import Main from "./pages/main"
import MyBell from "./pages/my-bell"

function subscribePathname(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange)
  return () => window.removeEventListener("popstate", onStoreChange)
}

function getPathname() {
  return window.location.pathname.replace(/\/$/, "") || "/"
}

export default function App() {
  const pathname = useSyncExternalStore(subscribePathname, getPathname, () => "/")

  if (pathname === "/my-bell") return <MyBell />
  return <Main />
}