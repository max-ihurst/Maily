import { CommandInteraction, CacheType, Client } from 'discord.js';
import Command from '../Command';

export default class MailCommand implements Command {
    public client: Client;
    public name = 'mail';
    public guildOnly = true;

    public constructor(client: Client) {
        this.client = client;
    }

    public execute(interaction: CommandInteraction<CacheType>): void {
        const sub = interaction.options.getSubcommand();
        const command = this.client.commands.modules.get(sub);

        if (command) {
            command?.execute(interaction);
        }
    }
}
