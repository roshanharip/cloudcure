import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';

@Controller({
    version: VERSION_NEUTRAL, // Optional: so /healthz doesn't get prefixed with /v1/healthz
})
export class AppController {
    @Get('healthz')
    getHealth(): string {
        return 'OK Hello World';
    }
}
