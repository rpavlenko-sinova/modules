export function getSearchParams(url: string) {
  const searchParams = new URL(url).searchParams;
  return searchParams;
}