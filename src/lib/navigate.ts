/** history.pushState 기반 클라이언트 사이드 네비게이션 */
export function navigate(path: string) {
  history.pushState({}, "", path)
  window.dispatchEvent(new PopStateEvent("popstate"))
}
