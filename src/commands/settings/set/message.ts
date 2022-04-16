import { CommandInteraction, CacheType, Client } from 'discord.js';
import Command from '../../../Command';

export default class SettingsMessageCommand implements Command {
    public client: Client;
    public name = 'message';
    public guildOnly = true;

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const message = interaction.options.getString('message');

        await this.client.settings.set(
            interaction.guild?.id as string,
            'message',
            message
        );

        await interaction.reply(
            `Sucessfully configured the mail ticket messsage.`
        );
    }
}
