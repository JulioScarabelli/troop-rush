let currentTheme = "default";

export function setTheme(theme: string) {
  currentTheme = theme;
}

export function getTheme(): string {
  return currentTheme;
}

export function resolveSpritePath(path: string): string {
  if (path.includes("/themes/")) return path;
  if (path.startsWith("/sprites/")) {
    const rest = path.replace("/sprites/", "");
    return `/sprites/themes/${currentTheme}/${rest}`;
  }
  return path;
}
