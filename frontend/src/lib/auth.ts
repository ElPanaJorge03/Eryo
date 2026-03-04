/**
 * Utilidades de autenticación del admin (lado cliente).
 * El token JWT se guarda en localStorage.
 */

const TOKEN_KEY = "eryo_token";

export function getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
    const token = getToken();
    if (!token) return false;
    // Verificación básica de expiración leyendo el payload del JWT
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
}
