import {
    CommandInteraction,
    CacheType,
    Client,
    TextChannel,
    Permissions,
    GuildMember,
    Snowflake,
} from 'discord.js';

import MailModel from '../../models/Mails';
import { Guild } from '../../types/types';
import Command from '../../Command';

export default class MailUnclaimCommand implements Command {
    public client: Client;
    public name = 'unclaim';

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
        } else if (!doc.claimer) {
            return await interaction.reply({
                content: 'This ticket was never claimed to begin with.',
                ephemeral: true,
            });
        }

        try {
            const role = interaction.guild?.roles.cache.get(settings.access);
            if (role) {
                await (
                    interaction.channel as TextChannel
                ).permissionOverwrites.edit(role, {
                    [Permissions.FLAGS.VIEW_CHANNEL.toString()]: true,
                });
            }

            await (
                interaction.channel as TextChannel
            ).permissionOverwrites.edit(interaction.guild?.id as Snowflake, {
                [Permissions.FLAGS.VIEW_CHANNEL.toString()]: false,
            });

            await doc.updateOne({ $unset: { claimer: 1 } });

            try {
                const panel = await interaction.channel?.messages.fetch(
                    doc.panel
                );

                if (panel) {
                    const embed = panel.embeds[0];
                    embed.spliceFields(embed.fields.length - 1, 1);

                    await panel.edit({
                        content: panel.content,
                        embeds: [embed],
                        components: panel.components,
                    });
                }
            } catch (error) {
                console.error(error);
            }

            await interaction.reply({
                content: `This mail ticket has now been unclaimed.`,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error running this command!',
                ephemeral: true,
            });
        }
    }
}
