import { CommandInteraction, CacheType, Client, Permissions } from 'discord.js';
import { Settings } from '../../types/types';
import Command from '../../Command';

export default class SettingsResetCommand implements Command {
    public client: Client;
    public name = 'reset';

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const setting = interaction.options.getString('setting') as Settings;

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
            await this.client.settings.delete(
                interaction.guild?.id as string,
                setting
            );

            await interaction.reply(
                `Successfully reset the ${setting} setting.`
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
