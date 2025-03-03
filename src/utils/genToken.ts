import jwt from 'jsonwebtoken'
import 'dotenv/config'

export const genToken = (id:string) => {
    const token = jwt.sign({id},process.env.JWT_SECRET as string,{
        expiresIn:"3d"
    })
    return token
}