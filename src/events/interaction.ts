import { Client, CommandInteraction, CacheType } from 'discord.js';

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

        const command = this.client.commands.modules.get(
            interaction.customId.toLowerCase()
        );

        if (['LOCK', 'UNLOCK'].includes(interaction.customId)) {
            await interaction.deferUpdate();
        }

        command?.execute(interaction);
    }
}
