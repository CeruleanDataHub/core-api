import { NestMiddleware, Injectable } from "@nestjs/common";
import { Request, Response } from 'express';
import * as https from 'https';

@Injectable()
export class WebhookValidationMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: Function) {
        const callbackUrl = req.header("webhook-request-callback");
        if (callbackUrl) {
            console.log("Trying to automatically validate webhook...");
            this.callValidationUrl(callbackUrl);
            res.status(204);
            res.send();
        } else {
            next();
        }
    }

    callValidationUrl = (callbackUrl: string) => {
        setTimeout(() => {
            https.get(callbackUrl, (resp) => {
                resp.on('data', () => {
                    console.log("Got response from validation url:", callbackUrl);
                });
            }).on("error", (err) => {
                console.log("Error automatically validating the endpoint:", callbackUrl);
                console.log(err.message);
            });
        }, 5000);
    }
}
