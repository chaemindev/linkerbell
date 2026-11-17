import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const compiled = ts.transpileModule(readFileSync(new URL('../server/weather.ts', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
}).outputText
let instance = 0
const load = () => import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}#${instance++}`)
const now = Date.parse('2026-11-17T01:50:00Z')
const observed = [
  { category: 'T1H', obsrValue: '13.6', baseDate: '20261117', baseTime: '1000' },
  { category: 'PTY', obsrValue: '0', baseDate: '20261117', baseTime: '1000' },
]
const forecast = [
  { category: 'SKY', fcstValue: '4', fcstDate: '20261117', fcstTime: '1200' },
  { category: 'SKY', fcstValue: '3', fcstDate: '20261117', fcstTime: '1100' },
]
const json = (items) => new Response(JSON.stringify({ response: { header: { resultCode: '00' }, body: { items: { item: items } } } }))
function response() {
  return { statusCode: 0, headers: {}, setHeader(key, value) { this.headers[key] = value }, end(body) { this.data = JSON.parse(body) } }
}
const request = { method: 'GET', url: '/api/weather?latitude=37.5665&longitude=126.9780' }

test('KMA grid conversion and midnight publication dates', async () => {
  const { toGrid, baseTime } = await load()
  assert.deepEqual(toGrid(37.5665, 126.978), { nx: 60, ny: 127 })
  assert.deepEqual(toGrid(35.1796, 129.0756), { nx: 98, ny: 76 })
  const midnight = Date.parse('2026-11-16T15:05:00Z')
  assert.deepEqual(baseTime(midnight, false), { base_date: '20261116', base_time: '2350' })
  assert.deepEqual(baseTime(midnight, true), { base_date: '20261116', base_time: '2330' })
})

test('KMA precipitation and sky map to existing visual effects', async () => {
  const { weatherCode } = await load()
  assert.equal(weatherCode(3, 4), 73)
  assert.equal(weatherCode(7, 4), 73)
  assert.equal(weatherCode(2, 4), 61)
  assert.equal(weatherCode(6, 4), 61)
  assert.equal(weatherCode(1, 4), 61)
  assert.equal(weatherCode(4, 4), 80)
  assert.equal(weatherCode(0, 1), 0)
  assert.equal(weatherCode(0, 3), 2)
  assert.equal(weatherCode(0, 4), 3)
  assert.throws(() => weatherCode(0, -999))
})

test('combines observation and nearest forecast, coalesces requests, and caches by grid', async (t) => {
  const { handleWeatherRequest } = await load()
  t.mock.method(Date, 'now', () => now)
  const urls = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    urls.push(new URL(url))
    return json(String(url).includes('getUltraSrtNcst') ? observed : forecast)
  })
  const a = response(), b = response()
  await Promise.all([handleWeatherRequest(request, a, 'test-key'), handleWeatherRequest(request, b, 'test-key')])
  assert.equal(a.statusCode, 200)
  assert.deepEqual(a.data, b.data)
  assert.deepEqual(a.data.current, { temperature_2m: 13.6, weather_code: 2, is_day: 1 })
  assert.equal(a.data.source, '기상청')
  assert.equal(urls.length, 2)
  assert.ok(urls.every(url => url.hostname === 'apis.data.go.kr' && url.searchParams.get('serviceKey') === 'test-key'))
  await handleWeatherRequest(request, response(), 'test-key')
  assert.equal(urls.length, 2)
  assert.equal(JSON.stringify(a.data).includes('test-key'), false)
})

test('retries previous publication when latest data is unavailable', async (t) => {
  const { handleWeatherRequest } = await load()
  t.mock.method(Date, 'now', () => now)
  const calls = new Map()
  t.mock.method(globalThis, 'fetch', async (url) => {
    const path = new URL(url).pathname
    const count = (calls.get(path) ?? 0) + 1
    calls.set(path, count)
    if (count === 1) return new Response(JSON.stringify({ response: { header: { resultCode: '03' } } }))
    return json(path.endsWith('getUltraSrtNcst') ? observed : forecast)
  })
  const res = response()
  await handleWeatherRequest(request, res, 'test-key')
  assert.equal(res.statusCode, 200)
  assert.deepEqual([...calls.values()], [2, 2])
})

test('validates inputs, method, and missing server credential without upstream requests', async (t) => {
  const { handleWeatherRequest } = await load()
  const fetch = t.mock.method(globalThis, 'fetch', () => { throw new Error('Unexpected request') })
  for (const [req, key, status] of [
    [{ method: 'GET', url: '/api/weather?latitude=NaN' }, 'test', 400],
    [{ method: 'GET', url: '/api/weather?latitude=&longitude=127' }, 'test', 400],
    [{ method: 'GET', url: '/api/weather?latitude=51&longitude=0' }, 'test', 400],
    [request, '', 503],
    [{ ...request, method: 'POST' }, 'test', 405],
  ]) {
    const res = response()
    await handleWeatherRequest(req, res, key)
    assert.equal(res.statusCode, status)
  }
  assert.equal(fetch.mock.callCount(), 0)
})

test('XML gateway authentication failure returns a safe error', async (t) => {
  const { handleWeatherRequest } = await load()
  t.mock.method(globalThis, 'fetch', async () => new Response('<OpenAPI_ServiceResponse><returnReasonCode>30</returnReasonCode></OpenAPI_ServiceResponse>'))
  const res = response()
  await handleWeatherRequest(request, res, 'test-secret')
  assert.equal(res.statusCode, 502)
  assert.match(res.data.error, /인증키/)
  assert.equal(JSON.stringify(res.data).includes('test-secret'), false)
  assert.equal(res.headers['Cache-Control'], 'no-store')
})

test('invalid observation values cannot become a false temperature', async (t) => {
  const { handleWeatherRequest } = await load()
  t.mock.method(globalThis, 'fetch', async (url) => json(String(url).includes('getUltraSrtNcst') ? [{ ...observed[0], obsrValue: '-999' }, observed[1]] : forecast))
  const res = response()
  await handleWeatherRequest(request, res, 'test-key')
  assert.equal(res.statusCode, 503)
  assert.equal(res.data.current, undefined)
})

test('network failure is recoverable and failed results are not cached', async (t) => {
  const { handleWeatherRequest } = await load()
  let failing = true
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (failing) throw new TypeError('private upstream URL with credential')
    return json(String(url).includes('getUltraSrtNcst') ? observed : forecast)
  })
  const failed = response()
  await handleWeatherRequest(request, failed, 'test-key')
  assert.equal(failed.statusCode, 503)
  assert.equal(JSON.stringify(failed.data).includes('credential'), false)
  await new Promise(resolve => setImmediate(resolve))
  failing = false
  const recovered = response()
  await handleWeatherRequest(request, recovered, 'test-key')
  assert.equal(recovered.statusCode, 200)
})

test('compiled deployment entry loads under Node ESM and ignores platform context', async (t) => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const { pathToFileURL } = await import('node:url')
  const directory = mkdtempSync(join(tmpdir(), 'kma-deployment-test-'))
  const oldKey = process.env.KMA_SERVICE_KEY
  try {
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ type: 'module' }))
    for (const file of ['api/weather.ts', 'server/weather.ts']) {
      mkdirSync(join(directory, file.split('/')[0]), { recursive: true })
      writeFileSync(join(directory, file.replace(/\.ts$/, '.js')), ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
      }).outputText)
    }
    const { default: handler } = await import(pathToFileURL(join(directory, 'api/weather.js')).href)
    process.env.KMA_SERVICE_KEY = 'deployment-test-key'
    t.mock.method(globalThis, 'fetch', async (url) => json(String(url).includes('getUltraSrtNcst') ? observed : forecast))
    const res = response()
    await handler(request, res, { waitUntil() {} })
    assert.equal(res.statusCode, 200)
    assert.equal(res.data.source, '기상청')

    const failed = response()
    await handler({ ...request, url: 'http://[' }, failed)
    assert.equal(failed.statusCode, 503)
    assert.match(failed.headers['Content-Type'], /application\/json/)
    assert.equal(failed.data.current, undefined)
  } finally {
    if (oldKey === undefined) delete process.env.KMA_SERVICE_KEY
    else process.env.KMA_SERVICE_KEY = oldKey
    rmSync(directory, { recursive: true, force: true })
  }
})

const readWeatherResponse = async (response) => {
  const code = ts.transpileModule(readFileSync(new URL('../src/lib/weatherResponse.ts', import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 },
  }).outputText
  const module = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
  return module.readWeatherResponse(response)
}

test('plain text hosting failures do not leak a JSON SyntaxError into the UI', async () => {
  for (const response of [
    new Response('A server error has occurred\nFUNCTION_INVOCATION_FAILED', { status: 500 }),
    new Response('<html>Bad gateway</html>', { status: 502 }),
    new Response('', { status: 503 }),
  ]) {
    await assert.rejects(readWeatherResponse(response), (error) => !(error instanceof SyntaxError) && /날씨 서버/.test(error.message))
  }
})

test('client accepts valid weather and preserves safe API errors', async () => {
  const current = { temperature_2m: 14, weather_code: 2, is_day: 1 }
  assert.deepEqual(await readWeatherResponse(Response.json({ current })), { current, hourly: [], observedAt: null })
  await assert.rejects(readWeatherResponse(Response.json({ error: '서버에 기상청 인증키 설정이 필요해요.' }, { status: 503 })), /인증키/)
  await assert.rejects(readWeatherResponse(Response.json({ current: { temperature_2m: null } })), /응답/)
  await assert.rejects(readWeatherResponse(new Response('<html>App shell</html>')), /응답 형식/)
})

test('hourly forecast groups categories, sorts across midnight, and excludes elapsed/incomplete hours', async () => {
  const { hourlyForecast } = await load()
  const at = Date.parse('2026-11-17T14:30:00Z') // 23:30 KST
  const slot = (date, time, temperature, pty, sky, pop = '0', rain = '강수없음') => [
    ['T1H', temperature], ['PTY', pty], ['SKY', sky], ['POP', pop], ['RN1', rain],
  ].map(([category, fcstValue]) => ({ category, fcstValue, fcstDate: date, fcstTime: time }))
  const rows = [
    ...slot('20261118', '0100', '3', '3', '4', '80', '1mm 미만'),
    ...slot('20261117', '2300', '6', '0', '3'),
    ...slot('20261118', '0000', '4', '1', '4', '60', '1mm 미만'),
    { category: 'SKY', fcstValue: '3', fcstDate: '20261118', fcstTime: '0200' },
    ...slot('20261118', '0300', '-999', '0', '3'),
    ...slot('20261118', '0400', '2', '0', '1', '-999', '-999'),
  ]
  const result = hourlyForecast(rows, at)
  assert.deepEqual(result.map(hour => hour.time.slice(11, 16)), ['00:00', '01:00', '04:00'])
  assert.deepEqual(result.map(hour => hour.code), [61, 73, 0])
  assert.equal(result[0].precipitationProbability, 60)
  assert.equal(result[0].day, false)
  assert.equal(result[2].precipitationProbability, null)
  assert.equal(result[2].precipitation, null)
})

test('hourly forecast includes at most six hours and API returns it alongside current weather', async (t) => {
  const { handleWeatherRequest } = await load()
  t.mock.method(Date, 'now', () => now)
  const hours = Array.from({ length: 8 }, (_, index) => [
    ['T1H', String(14 - index)], ['PTY', index > 2 ? '1' : '0'], ['SKY', '4'], ['POP', '40'], ['RN1', '1mm 미만'],
  ].map(([category, fcstValue]) => ({ category, fcstValue, fcstDate: '20261117', fcstTime: `${11 + index}00` }))).flat()
  t.mock.method(globalThis, 'fetch', async url => json(String(url).includes('getUltraSrtNcst') ? observed : hours))
  const res = response()
  await handleWeatherRequest(request, res, 'test-key')
  assert.equal(res.statusCode, 200)
  assert.equal(res.data.hourly.length, 6)
  assert.equal(res.data.hourly[0].temperature, 14)
  assert.equal(res.data.hourly[3].code, 61)
  const parsed = await readWeatherResponse(Response.json(res.data))
  assert.deepEqual(parsed.hourly, res.data.hourly)
})

test('uses latest ten-minute precipitation instead of an obsolete hourly observation', async (t) => {
  const { handleWeatherRequest, baseTime } = await load()
  const at = Date.parse('2026-11-17T06:48:00Z') // 15:48 KST
  t.mock.method(Date, 'now', () => at)
  assert.deepEqual(baseTime(at, false), { base_date: '20261117', base_time: '1530' })
  assert.deepEqual(baseTime(at, false, 1), { base_date: '20261117', base_time: '1520' })
  t.mock.method(globalThis, 'fetch', async (url) => {
    const query = new URL(url)
    if (!query.pathname.endsWith('getUltraSrtNcst')) return json(forecast)
    const slot = query.searchParams.get('base_time')
    return json([
      { category: 'T1H', obsrValue: '14.5', baseDate: '20261117', baseTime: slot },
      { category: 'PTY', obsrValue: slot === '1500' ? '0' : '1', baseDate: '20261117', baseTime: slot },
    ])
  })
  const res = response()
  await handleWeatherRequest(request, res, 'test-key')
  assert.equal(res.statusCode, 200)
  assert.equal(res.data.current.weather_code, 61)
  assert.equal(res.data.observedAt, '202611171530')
  assert.equal(res.headers['Cache-Control'], 'no-store')
  assert.equal((await readWeatherResponse(Response.json(res.data))).observedAt, '202611171530')
})
