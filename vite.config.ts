import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, loadEnv } from "vite"
import { handleWeatherRequest } from "./server/weather"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "KMA_")
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "kma-weather-api",
        configureServer(server) {
          server.middlewares.use("/api/weather", (request, response) => {
            void handleWeatherRequest(request, response, env.KMA_SERVICE_KEY)
          })
        },
        configurePreviewServer(server) {
          server.middlewares.use("/api/weather", (request, response) => {
            void handleWeatherRequest(request, response, env.KMA_SERVICE_KEY)
          })
        },
      },
    ],
    resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  }
})
