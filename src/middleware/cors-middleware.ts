import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

// Custom middleware to allow CORS requests.
// CORS could also be enabled globally in main.ts with app.enableCors(), but that
// seems to make it impossible to have custom logic in OPTIONS requests which is
// needed in automatic webhook validation.
@Injectable()
export class CorsMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: Function) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header(
            'Access-Control-Allow-Methods',
            'GET, POST, PATCH, PUT, DELETE, OPTIONS',
        );
        if (req.method === 'OPTIONS') {
            // Allow Content-Type header in preflight request because could not find a way prevent nestjs from sending it
            res.header('Access-Control-Allow-Headers', '*');
            res.status(204);
            res.send();
        } else {
            next();
        }
    }
}
