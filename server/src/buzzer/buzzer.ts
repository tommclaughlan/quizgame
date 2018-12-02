import { Request, Response, Router } from "express";

export class Buzzer {

    private static readonly baseUrl = '/api/buzzer';
    private buzzed : boolean;
    private whoBuzzed : string;

    constructor() {
        this.buzzed = true;
        this.whoBuzzed = '';
    }

    public static create(router : Router) {
        const buzzer = new Buzzer();
        router.get(this.baseUrl,  (req : Request, res : Response) => { buzzer.getBuzzer(req, res); });
        router.post(this.baseUrl,  (req : Request, res : Response) => { buzzer.registerBuzzer(req, res); });
        router.get(`${this.baseUrl}/buzz`, (req : Request, res : Response) => { buzzer.buzz(req, res); });
        router.get(`${this.baseUrl}/who`, (req : Request, res : Response) => { buzzer.getWhoBuzzed(req, res); });
        router.get(`${this.baseUrl}/reset`, (req : Request, res : Response) => { buzzer.resetBuzzer(req, res); });
    }

    public getBuzzer(req : Request, res : Response) {
        res.send({ name : req.session.name });
    }

    public registerBuzzer(req : Request, res : Response) {
        if (req.body.name) {
            req.session.name = req.body.name;
            req.session.save(err => console.log);
        }
        res.send({ name : req.session.name });
    }

    public buzz(req : Request, res : Response) {
        if (this.buzzed) {
            res.send(false);
        } else {
            this.buzzed = true;
            this.whoBuzzed = req.session.name;
            res.send(true);
        }
    }

    public getWhoBuzzed(req : Request, res : Response) {
        if (this.buzzed) {
            console.log(this.whoBuzzed);
            res.send({ name : this.whoBuzzed });
        } else {
            res.send();
        }
    }

    public resetBuzzer(req : Request, res : Response) {
        this.buzzed = false;
        this.whoBuzzed = '';
        res.send();
    }
}