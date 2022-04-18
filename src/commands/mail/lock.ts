import {
    CommandInteraction,
    CacheType,
    Client,
    Permissions,
    TextChannel,
    MessageButton,
    GuildMember,
    OverwriteResolvable,
} from 'discord.js';

import MailModel from '../../models/Mails';
import { Guild } from '../../types/types';
import Command from '../../Command';

export default class MailLockCommand implements Command {
    public client: Client;
    public name = 'lock';

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

        if (interaction.channel?.type == 'DM') {
            return await interaction.reply({
                content: "This command cannot be used in DM's",
                ephemeral: true,
            });
        } else if (!doc) {
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
                    'You must have either the mail access role or `MANAGE_GUILD` permissions.',
                ephemeral: true,
            });
        }

        try {
            const permissions: OverwriteResolvable[] = [
                {
                    id: interaction.guild?.id as string,
                    deny: [Permissions.FLAGS.VIEW_CHANNEL],
                },
            ];

            const role = interaction.guild?.roles.cache.get(settings.access);
            if (role) {
                permissions.push({
                    id: role.id,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL],
                });
            }

            await (interaction.channel as TextChannel).permissionOverwrites.set(
                permissions
            );

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
                        .setCustomId('UNLOCK')
                        .setStyle('SECONDARY')
                        .setLabel('🔓 Unlock')
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
                content: 'There was an error locking this mail ticket!',
                ephemeral: true,
            });
        }
    }
}
