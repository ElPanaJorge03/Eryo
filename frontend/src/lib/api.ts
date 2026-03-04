import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
    headers: { "Content-Type": "application/json" },
});

// Agrega el JWT en cada request si está disponible
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("eryo_token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Redirige al login si el token expiró
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            const isLoginPage = window.location.pathname.includes("/admin/login");
            if (!isLoginPage) {
                localStorage.removeItem("eryo_token");
                window.location.href = "/admin/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
