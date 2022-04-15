import { CommandInteraction, CacheType, Client } from 'discord.js';
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

        console.log(setting);

        await this.client.settings.delete(
            interaction.guild?.id as string,
            setting
        );

        await interaction.reply(`Successfully reset the ${setting} setting.`);
    }
}
