import { Users } from '../class/users';

export interface JwtResponse {
    _id: any,
    name: string,
    email: string,
    access_token: string,
    expires_in: number
}