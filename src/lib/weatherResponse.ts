type CurrentWeather = { temperature_2m: number; weather_code: number; is_day: 0 | 1 }

export async function readWeatherResponse(response: Response): Promise<CurrentWeather> {
  // Hosting platforms may return plain text or HTML when a function fails to start.
  const text = await response.text()
  let payload
  try { payload = JSON.parse(text) } catch {
    throw new Error(response.ok
      ? "날씨 서버 응답 형식이 올바르지 않아요. 잠시 후 다시 시도해 주세요."
      : `날씨 서버가 정상적으로 실행되지 않았어요(${response.status}). 잠시 후 다시 시도해 주세요.`)
  }
  if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : `날씨 서버 오류(${response.status})가 발생했어요. 잠시 후 다시 시도해 주세요.`)
  const current = payload?.current
  if (!Number.isFinite(current?.temperature_2m) || !Number.isInteger(current?.weather_code) || ![0, 1].includes(current?.is_day)) {
    throw new Error("날씨 서버 응답을 확인하지 못했어요. 자동으로 다시 시도해요.")
  }
  return current
}
