import { CommandInteraction, CacheType, Client, Permissions } from 'discord.js';
import Command from '../../../Command';

export default class SettingsMessageCommand implements Command {
    public client: Client;
    public name = 'message';
    public cooldown = 10;

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const message = interaction.options.getString('message');
        const cooldown = this.client.util.cooldown(this, interaction.user);

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
        } else if (cooldown) {
            return await interaction.reply({
                content: `You're on cooldown wait \`${cooldown}\`s before reusing this command.`,
                ephemeral: true,
            });
        }

        try {
            await this.client.settings.set(
                interaction.guild?.id as string,
                'message',
                message
            );

            await interaction.reply(
                `You have successfully set the mail panel message.`
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
