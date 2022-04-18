import {
    CommandInteraction,
    CacheType,
    Client,
    Permissions,
    TextChannel,
    MessageButton,
    GuildMember,
} from 'discord.js';

import MailModel from '../../models/Mails';
import { Guild } from '../../types/types';
import Command from '../../Command';

export default class MailUnlockCommand implements Command {
    public client: Client;
    public name = 'unlock';
    public guildOnly = true;

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const doc = await MailModel.findOne({ id: interaction.channel?.id });
        const settings = this.client.settings.cache.get(
            interaction.guild?.id as string
        ) as Guild;

        if (!doc) {
            return await interaction.reply({
                content: 'This command must be used in a mail ticket!',
                ephemeral: true,
            });
        } else if (
            !this.client.util.hasAccess(
                settings,
                interaction.member as GuildMember
            )
        ) {
            return await interaction.reply({
                content:
                    'You must have either the mail access role or manage guild permissions.',
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
                        .setLabel('🔒 Lock')
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
