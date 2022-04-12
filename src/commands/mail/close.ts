import {
    CommandInteraction,
    CacheType,
    Client,
    MessageActionRow,
    MessageButton,
} from 'discord.js';

import MailModel from '../../models/Mails';
import Command from '../../Command';

export default class MailCloseCommand implements Command {
    public client: Client;
    public name = 'close';

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const doc = await MailModel.findOne({ id: interaction.channel?.id });

        if (!doc) {
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

        await interaction.reply({
            content: 'Are you sure you want to close this mail ticket?',
            components: [row],
        });

        row.components.forEach((component) => (component.disabled = true));

        const collector = interaction.channel?.createMessageComponentCollector({
            time: 3 * 1000,
        });

        this.client._cachedMails.add(interaction.channel?.id as string);

        collector?.once('collect', async (i) => {
            await i.deferUpdate();

            if (i.customId == 'CONFIRM') {
                try {
                    await MailModel.deleteOne({ id: interaction.channel?.id });
                    await interaction.channel?.delete();
                } catch (error) {
                    console.log(error);

                    await interaction.editReply({
                        content: 'There was an error closing this ticket!',
                        components: [row],
                    });
                }
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
            }
        });
    }
}
