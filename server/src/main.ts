import { Application, Request, Response } from "express";
import * as express from "express";
import * as path from "path";
import * as nunjucks from "nunjucks";
import * as session from "express-session";
import * as bodyParser from "body-parser";
import { Screen, Score } from '../../quiz-app/src/app/screen/screen.component';

export interface CommEvent {
    action : string;
    name? : string;
    id? : string;
    sound? : string;
    buzzed? : boolean;
    question? : Screen;
    questionNum? : number;
    scores? : Score[];
}

class App {
    public app : Application;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    private config() {
        this.app.set("port", 3000);
        this.app.set("views", path.join(__dirname, "./views"));
        this.app.use(bodyParser.json());

        // just using a local session store for now - this should
        // probably end up being a mongo store or something
        this.app.use(session({
            resave : false,
            saveUninitialized : true,
            secret : 'quizzical'
        }));

        nunjucks.configure('views', {
            express : this.app
        });
    }

    public routes() {
        const router = express.Router();

        router.get("/", (req : Request, res : Response) => {
            res.render('index.njk');
        });

        this.app.use(router);
    }
}

export default new App();