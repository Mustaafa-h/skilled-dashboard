export function getUserFromLocalStorage() {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split(".")[1]));
                return payload;
            } catch (error) {
                console.error("Invalid token", error);
                return null;
            }
        }
    }
    return null;
}
