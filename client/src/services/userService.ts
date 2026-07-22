import type { User } from "../types/user.types";
import type { Success } from "../types/response.types";
import api from "../utils/api";

export interface UserCreateData {
    name: string;
    email: string;
    password?: string;
    [key: string]: any;
}

export interface UserUpdateData {
    name?: string;
    email?: string;
    [key: string]: any;
}

const userService = {
    findAll: async () => {
        const response = await api.get<Success>( "/users");
        return response.data.data;
    },

    findByUserId: async (userId: string) => {
        const response = await api.get<User>(`/users/user-id/${userId}`);
        return response.data;
    },

    findByEmail: async (email: string) => {
        const response = await api.get<User>(`/users/email/${email}`);
        return response.data;
    },

    findById: async (id: number) => {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    },

    update: async (id: number, data: UserUpdateData) => {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/users/${id}`);
        return response.data;
    },
};

export default userService;