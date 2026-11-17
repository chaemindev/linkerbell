import type { IncomingMessage, ServerResponse } from "node:http"
import { handleWeatherRequest } from "../server/weather.js"

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  try {
    // Keep Vercel's invocation arguments separate from the server credential.
    await handleWeatherRequest(request, response, process.env.KMA_SERVICE_KEY)
  } catch {
    // Do not expose exception text: upstream failures can contain the API key.
    if (!response.headersSent) {
      response.statusCode = 503
      response.setHeader("Content-Type", "application/json; charset=utf-8")
      response.setHeader("Cache-Control", "no-store")
    }
    if (!response.writableEnded) response.end(JSON.stringify({ error: "날씨 서버 실행 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요." }))
  }
}
