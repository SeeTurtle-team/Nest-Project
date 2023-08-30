import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AdminService {
    constructor(){}

    private readonly logger = new Logger(AdminService.name);
}
