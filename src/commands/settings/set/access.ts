import { CommandInteraction, CacheType, Client } from 'discord.js';
import Command from '../../../Command';

export default class SettingsAccessCommand implements Command {
    public client: Client;
    public name = 'access-role';
    public guildOnly = true;

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const role = interaction.options.getRole('role');

        await this.client.settings.set(
            interaction.guild?.id as string,
            'access',
            role?.id
        );

        await interaction.reply(`Sucessfully set the access role to ${role}.`);
    }
}
