import { CommandInteraction, CacheType, Client, Permissions } from 'discord.js';
import Command from '../../../Command';

export default class SettingsCategoryCommand implements Command {
    public client: Client;
    public name = 'category';
    public guildOnly = true;
    public permissions = [Permissions.FLAGS.MANAGE_GUILD];

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const category = interaction.options.getChannel('category');

        await this.client.settings.set(
            interaction.guild?.id as string,
            'parent',
            category?.id
        );

        await interaction.reply(
            `Sucessfully set the category to ${category?.name}.`
        );
    }
}
