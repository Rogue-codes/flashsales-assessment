import { IUser } from "../models/userModel";

export const serializeResponse = (user:IUser) => {
    const {password, ...rest} = user.toObject()
    return rest  
}