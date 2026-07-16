export interface User{
    id: number;
    name: string;
    email: string;
    role: 'manufacturer'|'investor'| 'admin';
    is_active?: boolean;
    companyId?: string;
    companyName? : string;
    created_at?: Date,
    updated_at?: Date,
    
}
export interface UserPayload{
    id: number;
    name: string;
    email: string;
    role: 'manufacturer'|'investor'| 'admin';
    is_active: boolean;
}
export interface SignupPayload{
    name: string;
    email: string;
    role?: 'manufacturer'|'investor'| 'admin';
    password: string;
    companyName?: string;
    is_active?: boolean;

}