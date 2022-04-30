import {
    CommandInteraction,
    CacheType,
    Client,
    TextChannel,
    Permissions,
    GuildMember,
    DiscordAPIError,
} from 'discord.js';

import MailModel from '../../models/Mails';
import { Guild } from '../../types/types';
import Command from '../../Command';

export default class MailClaimCommand implements Command {
    public client: Client;
    public name = 'claim';

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
                content: 'This command can only be used in a mail ticket!',
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
        } else if (doc.claimer) {
            return await interaction.reply({
                content: `This mail ticket is already claimed by <@${doc.claimer}>`,
                ephemeral: true,
            });
        }

        try {
            await (interaction.channel as TextChannel).permissionOverwrites.set(
                [
                    {
                        id: interaction.guild?.id as string,
                        deny: Permissions.FLAGS.VIEW_CHANNEL,
                    },
                    {
                        id: interaction.user.id,
                        allow: Permissions.FLAGS.VIEW_CHANNEL,
                    },
                ]
            );

            doc.claimer = interaction.user.id;
            await doc.save();

            try {
                const panel = await interaction.channel?.messages.fetch(
                    doc.panel
                );

                if (panel) {
                    const embed = panel.embeds[0];
                    embed.addField('Claimed', interaction.user.toString());
                    await this.client.util.edit(panel, { embeds: [embed] });
                }
            } catch (error) {
                console.error(error);
            }

            await interaction.reply({
                content: `This mail ticket has been claimed by ${interaction.user}.`,
            });
        } catch (error) {
            if (error instanceof DiscordAPIError) {
                if (error.httpStatus == 403) {
                    await interaction.reply({
                        content: [
                            'I seem to be missing permissions to run this command.',
                            'Ensure that I have permissions to `MANAGE_CHANNELS`.',
                        ].join('\n'),
                        ephemeral: true,
                    });
                }
            } else {
                await interaction.reply({
                    content: 'There was an unkown error running this command!',
                    ephemeral: true,
                });

                console.error(error);
            }
        }
    }
}
