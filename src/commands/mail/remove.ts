import {
    CommandInteraction,
    CacheType,
    Client,
    TextChannel,
    Permissions,
    User,
    GuildMember,
    DiscordAPIError,
} from 'discord.js';

import MailModel from '../../models/Mails';
import { Guild } from '../../types/types';
import Command from '../../Command';

export default class MailRemoveCommand implements Command {
    public client: Client;
    public name = 'remove';

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const doc = await MailModel.findOne({ id: interaction.channel?.id });
        const user = interaction.options.getUser('user') as User;
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
        }

        try {
            await (
                interaction.channel as TextChannel
            ).permissionOverwrites.edit(user.id, {
                [Permissions.FLAGS.VIEW_CHANNEL.toString()]: false,
            });

            await interaction.reply(
                `Successfully removed ${user.toString()} from the mail ticket!`
            );
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
                    content: 'There was an error running this command!',
                    ephemeral: true,
                });

                console.error(error);
            }
        }
    }
}
