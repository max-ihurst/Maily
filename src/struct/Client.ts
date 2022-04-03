import { Client, Intents } from 'discord.js';
import 'dotenv/config';

export default class ModMail extends Client {
    constructor() {
        super({
            intents: [Intents.FLAGS.GUILDS]
        })

        this.on('ready', () => console.log('Yoo this is ready!'));
    }

    public start() {
        return super.login(process.env.DISCORD_TOKEN as string);
    }
}