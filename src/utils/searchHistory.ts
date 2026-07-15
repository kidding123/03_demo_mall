const STORAGE_KEY = 'mall_search_history'
const MAX_HISTORY = 10

export function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addSearchHistory(keyword: string) {
  // 去重：如果已经搜过这个词，先移除旧的，再插到最前面
  const list = getSearchHistory().filter((item) => item !== keyword)
  list.unshift(keyword)
  const trimmed = list.slice(0, MAX_HISTORY)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

export function clearSearchHistory() {
  localStorage.removeItem(STORAGE_KEY)
}
