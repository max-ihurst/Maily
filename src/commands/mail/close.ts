import {
    CommandInteraction,
    CacheType,
    Client,
    MessageActionRow,
    MessageButton,
    Message,
    GuildMember,
    DiscordAPIError,
} from 'discord.js';

import MailModel from '../../models/Mails';
import { Guild } from '../../types/types';
import Command from '../../Command';

export default class MailCloseCommand implements Command {
    public client: Client;
    public name = 'close';
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
                content: 'This command can only be used in a mail ticket!',
                ephemeral: true,
            });
        } else if (
            this.client._cachedMails.has(interaction.channel?.id as string)
        ) {
            return await interaction.reply({
                content: 'You are already closing this mail ticket!',
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

        const row = new MessageActionRow().addComponents([
            new MessageButton()
                .setCustomId('CONFIRM')
                .setStyle('SUCCESS')
                .setLabel('Yes'),
            new MessageButton()
                .setCustomId('DENY')
                .setStyle('DANGER')
                .setLabel('No'),
        ]);

        try {
            const message = (await interaction.channel?.messages.fetch(
                doc.panel
            )) as Message;

            message.components[0].components[1].disabled = true;
            const { components } = message;

            await this.client.util.edit(message, { components });
        } catch (error) {
            console.log(error);
        }

        await interaction.reply({
            content: 'Are you sure you want to close this mail ticket?',
            components: [row],
        });

        row.components.forEach((component) => (component.disabled = true));

        const collector = interaction.channel?.createMessageComponentCollector({
            time: 60 * 1000,
        });

        this.client._cachedMails.add(interaction.channel?.id as string);

        collector?.once('collect', async (i) => {
            await i.deferUpdate();

            if (i.customId == 'CONFIRM') {
                try {
                    await interaction.channel?.delete();
                    await MailModel.deleteOne({ id: interaction.channel?.id });
                } catch (error) {
                    if (error instanceof DiscordAPIError) {
                        if (error.httpStatus == 403) {
                            await interaction.editReply({
                                content: [
                                    'I seem to be missing permissions to run this command.',
                                    'Ensure that I have permissions to `MANAGE_CHANNELS`.',
                                ].join('\n'),
                                components: [row],
                            });
                        }
                    } else {
                        await interaction.editReply({
                            content:
                                'There was an unkown error running this command!',
                            components: [row],
                        });

                        console.log(error);
                    }
                }

                return collector.stop('deleted');
            } else {
                try {
                    await interaction.editReply({
                        content: 'Cancelling the closing of this mail ticket!',
                        components: [row],
                    });
                } catch (error) {
                    console.log(error);
                }
            }

            collector.stop();
        });

        collector?.once('end', async (_, reason) => {
            this.client._cachedMails.delete(interaction.channel?.id as string);

            if (reason == 'time') {
                await interaction.editReply({
                    content:
                        'You have ran out of time for the closing of the ticket!',
                    components: [row],
                });
            } else if (reason == 'user') {
                try {
                    const msg = (await interaction.channel?.messages.fetch(
                        doc.panel
                    )) as Message;

                    msg.components[0].components[1].disabled = false;

                    await this.client.util.edit(msg, {
                        components: msg.components,
                    });

                    // eslint-disable-next-line no-empty
                } catch {}
            }
        });
    }
}
