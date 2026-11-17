import type { IncomingMessage, ServerResponse } from "node:http"

const BASE_URL = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0"
const CACHE_TTL = 10 * 60 * 1000
const cache = new Map<string, { expires: number; data: WeatherResponse }>()
const pending = new Map<string, Promise<WeatherResponse>>()

type Item = { category: string; obsrValue?: string; fcstValue?: string; baseDate: string; baseTime: string; fcstDate?: string; fcstTime?: string }
type WeatherResponse = {
  current: { temperature_2m: number; weather_code: number; is_day: number }
  hourly: HourlyForecast[]
  source: "기상청"
  observedAt: string
}
type HourlyForecast = {
  time: string; temperature: number; code: number; day: boolean
  precipitationProbability: number | null; precipitation: string | null
}
class WeatherError extends Error {
  status: number
  noData: boolean

  constructor(message: string, status = 503, noData = false) {
    super(message)
    this.status = status
    this.noData = noData
  }
}

// KMA's Lambert conformal conic projection (5 km forecast grid).
export function toGrid(latitude: number, longitude: number) {
  const rad = Math.PI / 180
  const slat1 = 30 * rad, slat2 = 60 * rad
  const sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(Math.tan(Math.PI / 4 + slat2 / 2) / Math.tan(Math.PI / 4 + slat1 / 2))
  const sf = Math.pow(Math.tan(Math.PI / 4 + slat1 / 2), sn) * Math.cos(slat1) / sn
  const ro = (6371.00877 / 5) * sf / Math.pow(Math.tan(Math.PI / 4 + 38 * rad / 2), sn)
  const ra = (6371.00877 / 5) * sf / Math.pow(Math.tan(Math.PI / 4 + latitude * rad / 2), sn)
  const theta = (longitude - 126) * rad * sn
  return { nx: Math.floor(ra * Math.sin(theta) + 43 + .5), ny: Math.floor(ro - ra * Math.cos(theta) + 136 + .5) }
}

export function baseTime(now: number, forecast: boolean, hoursBack = 0) {
  // Leave time for publication; UTC methods operate on a KST-shifted date.
  const date = new Date(now + 9 * 3600000 - (forecast ? 45 : 15) * 60000 - hoursBack * 3600000)
  return {
    base_date: date.toISOString().slice(0, 10).replaceAll("-", ""),
    base_time: `${String(date.getUTCHours()).padStart(2, "0")}${forecast ? "30" : "00"}`,
  }
}

export function weatherCode(precipitation: number, sky: number) {
  if ([3, 7].includes(precipitation)) return 73 // Snow / snow flurries
  if ([2, 6].includes(precipitation)) return 61 // Mixed rain/snow uses the rain animation
  if (precipitation === 4) return 80 // Showers
  if ([1, 5].includes(precipitation)) return 61 // Rain / drizzle
  if (precipitation !== 0) throw new WeatherError("기상청 강수 정보를 확인하지 못했어요.")
  if (sky === 1) return 0
  if (sky === 3) return 2
  if (sky === 4) return 3
  throw new WeatherError("기상청 하늘 상태를 확인하지 못했어요.")
}
async function requestItems(forecast: boolean, nx: number, ny: number, serviceKey: string, now: number): Promise<Item[]> {
  for (let previous = 0; previous < 2; previous++) {
    const params = new URLSearchParams({ serviceKey, dataType: "JSON", numOfRows: "1000", pageNo: "1", nx: String(nx), ny: String(ny), ...baseTime(now, forecast, previous) })
    let response: Response
    try {
      response = await fetch(`${BASE_URL}/${forecast ? "getUltraSrtFcst" : "getUltraSrtNcst"}?${params}`, { signal: AbortSignal.timeout(5500) })
    } catch { throw new WeatherError("기상청 서버 연결이 지연되고 있어요. 자동으로 다시 시도해요.") }
    if (!response.ok) throw new WeatherError("기상청 서버가 일시적으로 응답하지 않아요. 자동으로 다시 시도해요.", response.status === 429 ? 429 : 503)
    const text = await response.text()
    let payload
    try { payload = JSON.parse(text) } catch {
      // The API gateway returns XML for some authentication errors, even for JSON requests.
      const code = text.match(/<returnReasonCode>\s*(\d+)\s*<\/returnReasonCode>/)?.[1]
      throw apiError(code)
    }
    const code = String(payload?.response?.header?.resultCode ?? "")
    const items = payload?.response?.body?.items?.item
    if ((code === "03" || (code === "00" && (!Array.isArray(items) || !items.length))) && previous === 0) continue
    if (code !== "00") throw apiError(code)
    if (!Array.isArray(items) || !items.length) throw new WeatherError("기상청 최신 자료가 아직 준비되지 않았어요. 자동으로 다시 시도해요.", 503, true)
    return items
  }
  throw new WeatherError("기상청 최신 자료가 아직 준비되지 않았어요.", 503, true)
}

function apiError(code?: string) {
  if (["20", "21", "30", "31", "32"].includes(code ?? "")) return new WeatherError("기상청 인증키 또는 단기예보 서비스 활용 승인을 확인해 주세요.", 502)
  if (code === "22") return new WeatherError("기상청 API 요청 한도에 도달했어요. 잠시 후 다시 시도해요.", 429)
  return new WeatherError("기상청 최신 자료를 불러오지 못했어요. 자동으로 다시 시도해요.", 503, code === "03")
}

export function hourlyForecast(items: Item[], now: number): HourlyForecast[] {
  const groups = new Map<string, Map<string, string>>()
  for (const item of items) {
    if (!/^\d{8}$/.test(item.fcstDate ?? "") || !/^\d{4}$/.test(item.fcstTime ?? "") || item.fcstValue == null) continue
    const key = `${item.fcstDate}${item.fcstTime}`
    if (!groups.has(key)) groups.set(key, new Map())
    groups.get(key)!.set(item.category, item.fcstValue)
  }
  const result: HourlyForecast[] = []
  for (const [key, values] of [...groups].sort(([a], [b]) => a.localeCompare(b))) {
    const time = `${key.slice(0, 4)}-${key.slice(4, 6)}-${key.slice(6, 8)}T${key.slice(8, 10)}:${key.slice(10, 12)}:00+09:00`
    if (!Number.isFinite(Date.parse(time)) || Date.parse(time) <= now) continue
    if (!["T1H", "PTY", "SKY"].every((field) => values.has(field) && values.get(field)!.trim() !== "")) continue
    const temperature = Number(values.get("T1H")), pty = Number(values.get("PTY")), sky = Number(values.get("SKY"))
    if (!Number.isFinite(temperature) || temperature < -80 || temperature > 60) continue
    let code: number
    try { code = weatherCode(pty, sky) } catch { continue }
    const probability = values.has("POP") && values.get("POP")!.trim() !== "" ? Number(values.get("POP")) : NaN
    const rain = values.get("RN1")?.trim()
    const hour = Number(key.slice(8, 10))
    result.push({ time, temperature, code, day: hour >= 6 && hour < 18,
      precipitationProbability: Number.isFinite(probability) && probability >= 0 && probability <= 100 ? probability : null,
      precipitation: rain && rain !== "-999" ? rain : null })
  }
  return result.slice(0, 6)
}

async function loadWeather(nx: number, ny: number, key: string, now: number): Promise<WeatherResponse> {
  const [observed, forecast] = await Promise.all([requestItems(false, nx, ny, key, now), requestItems(true, nx, ny, key, now)])
  const temperature = observed.find((item) => item.category === "T1H")
  const precipitation = observed.find((item) => item.category === "PTY")
  const target = new Date(now + 9 * 3600000).toISOString().slice(0, 13).replace(/[-T]/g, "") + "00"
  const skies = forecast.filter((item) => item.category === "SKY" && /^\d{8}$/.test(item.fcstDate ?? "") && /^\d{4}$/.test(item.fcstTime ?? ""))
    .sort((a, b) => `${a.fcstDate}${a.fcstTime}`.localeCompare(`${b.fcstDate}${b.fcstTime}`))
  const sky = skies.find((item) => `${item.fcstDate}${item.fcstTime}` >= target) ?? skies.at(-1)
  if (!temperature || !precipitation || !sky || temperature.obsrValue == null || precipitation.obsrValue == null || sky.fcstValue == null) throw new WeatherError("기상청 응답에 필요한 날씨 정보가 없어요.")
  const degrees = Number(temperature.obsrValue), pty = Number(precipitation.obsrValue), skyValue = Number(sky.fcstValue)
  if (!Number.isFinite(degrees) || degrees < -80 || degrees > 60 || !Number.isInteger(pty)) throw new WeatherError("기상청 날씨 값을 확인하지 못했어요.")
  const hour = new Date(now + 9 * 3600000).getUTCHours()
  return { current: { temperature_2m: degrees, weather_code: weatherCode(pty, skyValue), is_day: hour >= 6 && hour < 18 ? 1 : 0 }, hourly: hourlyForecast(forecast, now), source: "기상청", observedAt: `${temperature.baseDate}${temperature.baseTime}` }
}

export async function handleWeatherRequest(request: IncomingMessage, response: ServerResponse, serviceKey = process.env.KMA_SERVICE_KEY) {
  const send = (status: number, data: unknown) => {
    response.statusCode = status
    response.setHeader("Content-Type", "application/json; charset=utf-8")
    response.setHeader("Cache-Control", status === 200 ? "private, max-age=300" : "no-store")
    response.end(JSON.stringify(data))
  }
  if (request.method !== "GET") { response.setHeader("Allow", "GET"); send(405, { error: "허용되지 않는 요청입니다." }); return }
  if (!serviceKey?.trim()) { send(503, { error: "서버에 기상청 인증키 설정이 필요해요." }); return }
  const url = new URL(request.url ?? "/", "http://localhost")
  const lat = url.searchParams.get("latitude"), lon = url.searchParams.get("longitude")
  const latitude = lat === null ? 37.5665 : Number(lat), longitude = lon === null ? 126.978 : Number(lon)
  if ((lat !== null && !lat.trim()) || (lon !== null && !lon.trim()) || !Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < 31.65 || latitude > 43.4 || longitude < 123.3 || longitude > 132.78) {
    send(400, { error: "기상청 날씨는 대한민국 주변 지역에서 조회할 수 있어요." }); return
  }
  const { nx, ny } = toGrid(latitude, longitude)
  if (nx < 1 || nx > 149 || ny < 1 || ny > 253) { send(400, { error: "기상청 예보 지역 범위를 벗어났어요." }); return }
  const cacheKey = `${nx},${ny}`, now = Date.now()
  try {
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > now) { send(200, cached.data); return }
    let task = pending.get(cacheKey)
    if (!task) {
      let decodedKey: string
      try { decodedKey = decodeURIComponent(serviceKey.trim()) } catch { throw new WeatherError("기상청 인증키 형식을 확인해 주세요.", 502) }
      task = loadWeather(nx, ny, decodedKey, now)
      pending.set(cacheKey, task)
      // Only successful responses are cached; keep the map bounded.
      void task.then((data) => {
        for (const [key, value] of cache) if (value.expires <= Date.now()) cache.delete(key)
        if (cache.size >= 250) cache.delete(cache.keys().next().value!)
        cache.set(cacheKey, { expires: Date.now() + CACHE_TTL, data })
      }).catch(() => {}).finally(() => { pending.delete(cacheKey) })
    }
    send(200, await task)
  } catch (error) {
    // Never log upstream URLs/errors: they may contain the service key.
    send(error instanceof WeatherError ? error.status : 503, { error: error instanceof WeatherError ? error.message : "기상청 날씨 조회에 실패했어요. 자동으로 다시 시도해요." })
  }
}
