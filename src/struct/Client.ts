import { Client, Intents, Permissions } from 'discord.js';
import CommandHandler from '../handlers/Command';
import EventHandler from '../handlers/Event';
import SettingsManager from './managers/Settings';
import * as mongoose from 'mongoose';
import 'dotenv/config';

declare module 'discord.js' {
    interface Client {
        commands: CommandHandler;
        events: EventHandler;
        settings: SettingsManager;
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
        this.settings = new SettingsManager();

        this._cachedMails = new Set();

        this.once('ready', () => console.log('Yoo this is ready!'));

        this.on('interactionCreate', async (interaction) => {
            if (!interaction.isCommand()) return;

            const name =
                interaction.options.getSubcommand(false) ||
                interaction.commandName;

            if (!name) return;

            const command = this.commands.modules.get(name);

            if (command) {
                const permissions = interaction.member
                    ?.permissions as Permissions;

                if (command.guildOnly && !interaction.guild) {
                    return await interaction.reply({
                        content: 'This command can only be used in guilds.',
                        ephemeral: true,
                    });
                } else if (
                    command.permissions &&
                    !permissions.has(command.permissions)
                ) {
                    const missing = permissions.missing(command.permissions);

                    return await interaction.reply({
                        content: [
                            "You're missing permissions to run this command",
                            '__**Missing Permissions**__',
                            missing.map((perm) => `- ${perm}`).join('\n'),
                        ].join('\n'),
                        ephemeral: true,
                    });
                }

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
