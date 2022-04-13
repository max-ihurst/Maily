import {
    Client,
    CommandInteraction,
    CacheType,
    TextChannel,
    Permissions,
    Message,
    MessageButton,
    MessageActionRow,
} from 'discord.js';

import MailModel from '../models/Mails';
import Event from '../Event';

export default class InteractionEvent implements Event {
    public client: Client;
    public name = 'interactionCreate';
    public once = false;

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        if (!interaction.isButton()) return;

        const doc = await MailModel.findOne({
            message: interaction.message.id,
        });

        if (!doc) return;

        const { message } = interaction;
        const channel = this.client.channels.cache.get(doc.id) as TextChannel;

        const row = (message.components as MessageActionRow[])[0];

        if (interaction.customId == 'LOCK') {
            await interaction.deferUpdate();

            try {
                await channel.permissionOverwrites.set([
                    {
                        id: interaction.guild?.id as string,
                        deny: Permissions.FLAGS.VIEW_CHANNEL,
                    },
                ]);

                row.spliceComponents(
                    0,
                    1,
                    new MessageButton()
                        .setCustomId('UNLOCK')
                        .setStyle('SECONDARY')
                        .setEmoji('🔓')
                );
            } catch (error) {
                console.error(error);

                await interaction.reply(
                    'There was an error locking this mail ticket!'
                );
            }
        } else if (interaction.customId == 'UNLOCK') {
            await interaction.deferUpdate();

            try {
                await channel.permissionOverwrites.edit(doc.user, {
                    [Permissions.FLAGS.VIEW_CHANNEL.toString()]: true,
                });

                row.spliceComponents(
                    0,
                    1,
                    new MessageButton()
                        .setCustomId('LOCK')
                        .setStyle('SECONDARY')
                        .setEmoji('🔒')
                );
            } catch (error) {
                console.error(error);

                await interaction.reply(
                    'There was an error unlocking this mail ticket!'
                );
            }
        } else if (interaction.customId == 'CLOSE') {
            const command = this.client.commands.modules.get('close');
            row.components[1].disabled = true;
            command?.execute(interaction);
        }

        await (interaction.message as Message).edit({
            content: message.content,
            embeds: [message.embeds[0]],
            components: [row],
        });
    }
}
