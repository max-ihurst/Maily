import {
    CommandInteraction,
    CacheType,
    Client,
    Permissions,
    TextChannel,
    MessageButton,
} from 'discord.js';

import MailModel from '../../models/Mails';
import Command from '../../Command';

export default class MailUnlockCommand implements Command {
    public client: Client;
    public name = 'unlock';
    public guildOnly = true;
    public permissions = [Permissions.FLAGS.MANAGE_GUILD];

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const doc = await MailModel.findOne({ id: interaction.channel?.id });

        if (!doc) {
            return await interaction.reply({
                content: 'This command must be used in a mail ticket!',
                ephemeral: true,
            });
        }

        try {
            await (
                interaction.channel as TextChannel
            ).permissionOverwrites.edit(doc.user, {
                [Permissions.FLAGS.VIEW_CHANNEL.toString()]: true,
            });

            if (!interaction.deferred) {
                await interaction.reply('Successfully locked the mail ticket.');
            }

            try {
                const message = await interaction.channel?.messages.fetch(
                    doc.panel
                );

                message?.components[0].spliceComponents(
                    0,
                    1,
                    new MessageButton()
                        .setCustomId('LOCK')
                        .setStyle('SECONDARY')
                        .setEmoji('🔒')
                );

                await message?.edit({
                    content: message.content,
                    embeds: [message.embeds[0]],
                    components: message.components,
                });
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            console.error(error);

            await interaction.reply({
                content: 'There was an error unlocking this mail ticket!',
                ephemeral: true,
            });
        }
    }
}
