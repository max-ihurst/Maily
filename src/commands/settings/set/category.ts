import { CommandInteraction, CacheType, Client, Permissions } from 'discord.js';
import Command from '../../../Command';

export default class SettingsCategoryCommand implements Command {
    public client: Client;
    public name = 'category';

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const category = interaction.options.getChannel('category');

        if (interaction.channel?.type == 'DM') {
            return await interaction.reply({
                content: "This command cannot be used in DM's",
                ephemeral: true,
            });
        } else if (
            !interaction.memberPermissions?.has(Permissions.FLAGS.MANAGE_GUILD)
        ) {
            return await interaction.reply({
                content:
                    'You need to have `MANAGE_GUILD` permissions to run this command.',
                ephemeral: true,
            });
        }

        try {
            await this.client.settings.set(
                interaction.guild?.id as string,
                'parent',
                category?.id
            );

            await interaction.reply(
                `You have sucessfully set \`${category?.name}\` as the mail category.`
            );
        } catch (error) {
            console.log(error);

            await interaction.reply({
                content: 'There was an error using this command.',
                ephemeral: true,
            });
        }
    }
}
