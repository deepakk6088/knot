import api from "./api";

export async function loginUser(identifier, password) {
    const response = await api.post("/auth/login", {
        identifier,
        password
    });

    return response.data;
}

export async function registerUser(userData) {
    const response = await api.post("/auth/register", userData);

    return response.data;
}
