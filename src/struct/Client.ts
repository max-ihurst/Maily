import { Client, Intents } from 'discord.js';
import CommandHandler from '../handlers/Command';
import EventHandler from '../handlers/Event';
import * as mongoose from 'mongoose';
import 'dotenv/config';

declare module 'discord.js' {
    interface Client {
        commands: CommandHandler;
        events: EventHandler;
        _cachedMails: Set<string>;
    }
}

export default class ModMail extends Client {
    constructor() {
        super({
            intents: [
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.DIRECT_MESSAGE_TYPING,
                Intents.FLAGS.GUILD_MESSAGES,
            ],

            partials: ['MESSAGE', 'CHANNEL'],
        });

        this.commands = new CommandHandler(this);
        this.events = new EventHandler(this);

        this._cachedMails = new Set();

        this.on('ready', () => console.log('Yoo this is ready!'));

        this.on('interactionCreate', (interaction) => {
            if (!interaction.isCommand()) return;

            const command = this.commands.modules.get(interaction.commandName);

            if (command) {
                try {
                    command.execute(interaction);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    }

    public async start() {
        await mongoose.connect(process.env.MONGODB_URI as string);
        return super.login(process.env.DISCORD_TOKEN as string);
    }
}
