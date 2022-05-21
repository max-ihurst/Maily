import {
    CommandInteraction,
    CacheType,
    Client,
    Permissions,
    TextChannel,
    MessageButton,
    GuildMember,
    Message,
    DiscordAPIError,
} from 'discord.js';

import MailModel from '../../models/Mails';
import { Guild } from '../../types/types';
import Command from '../../Command';

export default class MailUnlockCommand implements Command {
    public client: Client;
    public name = 'unlock';
    public cooldown = 3;

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const doc = await MailModel.findOne({ id: interaction.channel?.id });
        const cooldown = this.client.util.cooldown(this, interaction.user);
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
        } else if (cooldown) {
            return await interaction.reply({
                content: `You're on cooldown wait \`${cooldown}\`s before reusing this command.`,
                ephemeral: true,
            });
        }

        try {
            await (
                interaction.channel as TextChannel
            ).permissionOverwrites.edit(doc.user, {
                [Permissions.FLAGS.VIEW_CHANNEL.toString()]: true,
            });

            await interaction.reply('Successfully unlocked the mail ticket.');

            try {
                const message = (await interaction.channel?.messages.fetch(
                    doc.panel
                )) as Message;

                message.components[0].spliceComponents(
                    0,
                    1,
                    new MessageButton()
                        .setCustomId('LOCK')
                        .setStyle('SECONDARY')
                        .setLabel('🔒 Lock')
                );

                const { components } = message;
                await this.client.util.edit(message, { components });
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            if (error instanceof DiscordAPIError) {
                if (error.httpStatus == 403) {
                    if (
                        !interaction.guild?.me?.permissions.has(
                            'MANAGE_CHANNELS'
                        )
                    ) {
                        await interaction.reply({
                            content: [
                                'I seem to be missing permissions to run this command.',
                                'Ensure that I have permissions to `MANAGE_CHANNELS`.',
                            ].join('\n'),
                            ephemeral: true,
                        });
                    } else {
                        await interaction.reply({
                            content:
                                'I seem to be having an issue with hierarchical permissions.',
                            ephemeral: true,
                        });
                    }
                }
            } else {
                await interaction.reply({
                    content: 'There was an error unlocking this mail ticket!',
                    ephemeral: true,
                });

                console.error(error);
            }
        }
    }
}
