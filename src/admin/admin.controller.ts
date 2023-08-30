import { Controller, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';

@Controller('admin')
@ApiTags('Admin API')
export class AdminController {
    constructor(
        private amdinService : AdminService,
    ){}

    private readonly logger = new Logger(AdminController.name);

}
