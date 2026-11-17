import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react"

type Weather = { temperature: number; code: number; day: boolean; fetchedAt: number }
const INTERVAL = 20 * 60 * 1000

function describeWeather(code: number, day: boolean) {
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: "☃️", label: "눈", effect: "snow" }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code))
    return { icon: code >= 95 ? "⛈️" : "🌧️", label: code >= 95 ? "뇌우" : "비", effect: "rain" }
  if ([45, 48].includes(code)) return { icon: "🌫️", label: "안개", effect: null }
  if (code === 0) return { icon: day ? "☀️" : "🌙", label: "맑음", effect: null }
  if (code === 1) return { icon: day ? "🌤️" : "☁️", label: "구름 조금", effect: null }
  if (code === 2) return { icon: day ? "⛅" : "☁️", label: "구름 많음", effect: null }
  return { icon: "☁️", label: "흐림", effect: null }
}

const WeatherContext = createContext<{
  locationLabel: string; weather: Weather | null; error: string | null; retry: () => void
}>({ locationLabel: "현재 위치", weather: null, error: null, retry: () => {} })

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [weather, setWeather] = useState<Weather | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [locationLabel, setLocationLabel] = useState("현재 위치")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (import.meta.env.DEV && new URLSearchParams(window.location.search).get("weather") === "rain") {
      setLocationLabel("비 테스트")
      setWeather({ temperature: 15, code: 61, day: true, fetchedAt: Date.now() })
      setError(null)
      return
    }
    const controller = new AbortController()
    let latest: (Weather & { locationKey: string }) | null = null
    let pending = false
    let disposed = false
    let retryTimer: number | undefined
    let failures = 0
    let locationTimer: number | undefined
    const refresh = async () => {
      if (pending || document.hidden) return
      window.clearTimeout(retryTimer)
      pending = true
      try {
        const position = navigator.geolocation
          ? await new Promise<GeolocationPosition | null>((resolve) => {
              const settle = (position: GeolocationPosition | null) => {
                window.clearTimeout(locationTimer)
                resolve(position)
              }
              // Browser permission prompts can outlive the geolocation timeout.
              locationTimer = window.setTimeout(() => settle(null), 10000)
              try {
                navigator.geolocation.getCurrentPosition(settle, () => settle(null), {
                  enableHighAccuracy: false, timeout: 10000, maximumAge: 60000,
                })
              } catch { settle(null) }
            })
          : null
        if (disposed) return
        // Use approximate coordinates; keep location and weather only in memory.
        const latitude = position ? position.coords.latitude.toFixed(2) : "37.5665"
        const longitude = position ? position.coords.longitude.toFixed(2) : "126.9780"
        setLocationLabel(position ? "현재 위치" : "서울")
        const locationKey = `${latitude},${longitude}`
        if (latest && latest.locationKey === locationKey && Date.now() - latest.fetchedAt < INTERVAL) return
        setWeather(null)
        setError(null)
        const requestController = new AbortController()
        const cancel = () => requestController.abort()
        controller.signal.addEventListener("abort", cancel, { once: true })
        const timeout = window.setTimeout(cancel, 15000)
        try {
          const params = new URLSearchParams({ latitude, longitude })
          const response = await fetch(`/api/weather?${params}`, { signal: requestController.signal })
          const payload = await response.json()
          if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "기상청 날씨 조회에 실패했어요. 자동으로 다시 시도해요.")
          const { current } = payload
          if (!Number.isFinite(current?.temperature_2m) || !Number.isInteger(current?.weather_code) || ![0, 1].includes(current?.is_day)) throw new Error("날씨 서버 응답을 확인하지 못했어요. 자동으로 다시 시도해요.")
          if (disposed) return
          latest = { temperature: current.temperature_2m, code: current.weather_code, day: current.is_day === 1, fetchedAt: Date.now(), locationKey }
          setWeather(latest)
          setError(null)
          failures = 0
        } catch (reason) {
          if (!disposed) {
            setWeather(null)
            setError(!navigator.onLine
              ? "인터넷 연결을 확인해 주세요. 연결되면 다시 조회해요."
              : requestController.signal.aborted
                ? "날씨 서버 응답이 늦어지고 있어요. 자동으로 다시 시도해요."
                : reason instanceof TypeError
                  ? "날씨 서버에 연결할 수 없어요. 자동으로 다시 시도해요."
                  : reason instanceof Error ? reason.message : "날씨 조회에 실패했어요. 자동으로 다시 시도해요.")
            failures += 1
            retryTimer = window.setTimeout(() => { void refresh() }, Math.min(10000 * 2 ** Math.min(failures - 1, 4), 120000))
          }
        } finally {
          window.clearTimeout(timeout)
          controller.signal.removeEventListener("abort", cancel)
        }
      } catch (reason) {
        if (!disposed) {
          setWeather(null)
          setError(reason instanceof Error ? reason.message : "현재 위치를 확인하지 못했어요.")
        }
      } finally { pending = false }
    }
    setWeather(null)
    setError(null)
    void refresh()
    const timer = window.setInterval(() => { void refresh() }, INTERVAL)
    const onVisible = () => { void refresh() }
    document.addEventListener("visibilitychange", onVisible)
    window.addEventListener("online", onVisible)
    return () => {
      disposed = true
      controller.abort()
      window.clearInterval(timer)
      window.clearTimeout(retryTimer)
      window.clearTimeout(locationTimer)
      document.removeEventListener("visibilitychange", onVisible)
      window.removeEventListener("online", onVisible)
    }
  }, [attempt])

  return <WeatherContext.Provider value={{ locationLabel, weather, error, retry: () => setAttempt((value) => value + 1) }}>{children}</WeatherContext.Provider>
}

export function WeatherWidget() {
  const { locationLabel, weather, error, retry } = useContext(WeatherContext)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000)
    return () => window.clearInterval(timer)
  }, [])
  const date = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(now).replace(/\.$/, "")
  const weekday = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", weekday: "long" }).format(now)
  const info = weather ? describeWeather(weather.code, weather.day) : null
  return (
    <details className="weather-widget relative shrink-0 border-l border-pink-100 pl-1 sm:pl-3">
      <summary className="flex cursor-pointer list-none items-center gap-0.5 rounded-xl px-2 py-2 text-xs text-stone-500 outline-none transition-colors hover:bg-pink-50 focus-visible:ring-2 focus-visible:ring-pink-200 sm:gap-3" aria-label={`${date} ${weekday}, ${locationLabel} ${info?.label ?? "날씨"} ${weather ? `${Math.round(weather.temperature)}도` : error ? "조회 실패" : "불러오는 중"}. 날씨 상세 열기`}>
        <span className="flex flex-col gap-0.5"><span className="font-medium tracking-wide">{date}<span className="ml-1 hidden sm:inline">{weekday}</span></span><span className="text-[10px] text-stone-400">{locationLabel}</span></span>
        <span aria-hidden="true" className="text-xl">{info?.icon ?? "☁️"}</span>
        <span className="min-w-6 font-medium tabular-nums">{weather ? `${Math.round(weather.temperature)}°` : "—"}</span>
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-56 rounded-2xl border border-pink-100 bg-white p-4 shadow-lg">
        <p className="mb-3 text-sm font-medium text-stone-600">오늘의 하늘 {info?.icon ?? "☁️"}</p>

        <p className="mt-3 text-xs text-stone-500" role="status">{weather ? `${info?.label} · ${Math.round(weather.temperature)}°C` : error ?? `${locationLabel} 날씨를 불러오고 있어요…`}</p>
        {error && <button type="button" onClick={retry} className="mt-3 rounded-lg bg-pink-50 px-3 py-1.5 text-xs text-stone-600 hover:bg-pink-100 focus-visible:outline-pink-300">다시 시도</button>}
        <a href="https://www.kma.go.kr/" target="_blank" rel="noreferrer" className="mt-2 text-[10px] text-stone-400 underline hidden">날씨 정보 제공: 기상청</a>
      </div>
    </details>
  )
}

export function WeatherBackground() {
  const { weather } = useContext(WeatherContext)
  const effect = weather ? describeWeather(weather.code, weather.day).effect : null
  const [paused, setPaused] = useState(document.hidden)
  useEffect(() => {
    const update = () => setPaused(document.hidden)
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  if (!effect) return null
  return <div aria-hidden="true" className={`weather-background weather-${effect} pointer-events-none fixed inset-x-0 bottom-0 top-16 z-0 overflow-hidden motion-reduce:hidden`}>
    {Array.from({ length: effect === "snow" ? 30 : 40 }, (_, index) => <span key={index} className="weather-particle absolute -top-8" style={{ left: `${(index * 37.7) % 100}%`, animationDelay: `${-(index * 0.73)}s`, animationDuration: `${effect === "snow" ? 9 + index % 8 : 1.3 + (index % 5) * 0.2}s`, animationPlayState: paused ? "paused" : "running", "--weather-drift": `${effect === "snow" ? (index % 2 ? 45 : -35) : -30}px`, width: effect === "snow" ? `${2 + index % 4}px` : undefined, height: effect === "snow" ? `${2 + index % 4}px` : undefined } as CSSProperties} />)}
  </div>
}
