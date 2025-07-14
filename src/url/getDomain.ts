export function getDomain(url: string) {
  const domain = new URL(url).hostname;
  return domain;
}