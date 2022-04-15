import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import 'dotenv/config';

import { 
    PingCommand, 
    MailCommand, 
    SettingsCommand 
} from './interactions/index';

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN as string);

try {
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

    console.log('Successfully reloaded interaction (/) commands.');
} catch (error) {
    console.log(error);
}
