import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class GetToken {
    constructor(
        private readonly jwtService: JwtService
    ){}

    async checkToken(token) {
        //const jwtService = new JwtService();
        console.log(token)
        console.log(process.env.JWT_CONSTANTS)
        return this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_CONSTANTS,
        });
    }
    
    async getToken(header){
        console.log(header.authorization)
        const token = header.authorization.replace('Bearer ','');
        const verified = await this.checkToken(token);
    
        return verified;
    }
}


