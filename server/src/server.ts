import main from './main';
import { Server } from 'ws';
import { Game } from './buzzer/buzzer';

const server = main.app.listen(3000, () => {
    console.log('Server listening on 3000');
});

const wss = new Server({ server });

Game.create(wss);
