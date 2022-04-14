import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import 'dotenv/config';

import { PingCommand, MailCommand, SettingsCommand } from './interactions/index';

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN as string);

try {
    if (process.env.NODE_ENV == 'PRODUCTION') {
        rest.put(
            Routes.applicationCommands(
                process.env.CLIENT_ID as string
            ), 
            {
                body: [
                    PingCommand, 
                    MailCommand,
                    SettingsCommand
                ],
            }
        );
    } else {
        rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID as string,
                process.env.GUILD_ID as string
            ),
            {
                body: [
                    PingCommand, 
                    MailCommand,
                    SettingsCommand
                ],
            }
        );
    }

    console.log('Successfully reloaded interaction (/) commands.');
} catch (error) {
    console.log(error);
}
