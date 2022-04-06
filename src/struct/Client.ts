import { Client, Intents } from 'discord.js';
import CommandHandler from '../handlers/CommandHandler';
import * as mongoose from 'mongoose';
import 'dotenv/config';

declare module 'discord.js' {
    interface Client {
        commands: CommandHandler;
    }
}

export default class ModMail extends Client {
    constructor() {
        super({
            intents: [Intents.FLAGS.GUILDS],
        });

        this.commands = new CommandHandler(this);

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
