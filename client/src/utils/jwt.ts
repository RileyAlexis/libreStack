export function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    );
    return decoded?.exp ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
}
