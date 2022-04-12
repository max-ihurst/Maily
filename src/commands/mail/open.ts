import {
    CommandInteraction,
    CacheType,
    Client,
    MessageEmbed,
    Message,
    User,
    MessageReaction,
    Permissions,
} from 'discord.js';

import * as emoji from 'node-emoji';
import numberify from 'words-to-numbers';
import { chunk } from 'lodash';
import MailModel from '../../models/Mails';
import Command from '../../Command';

export default class MailOpenCommand implements Command {
    public client: Client;
    public name = 'open';

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const reason = interaction.options.getString('reason');

        if (interaction.channel?.type != 'DM') {
            return await interaction.reply({
                content: 'This command must be used in my DMs.',
                ephemeral: true,
            });
        }

        if (this.client._cachedMails.has(interaction.user.id)) {
            return await interaction.reply(
                "You're already opening a mail ticket!"
            );
        }

        /* Fetches all the guilds the member is in */
        try {
            const guilds = Array.from(this.client.guilds.cache.values());
            for (const guild of guilds) {
                await guild.members.fetch({ user: interaction.user.id });
            }
        } catch (error) {
            await interaction.reply({
                content: 'There was an error fetching guilds!',
                ephemeral: true,
            });

            return console.error(error);
        }

        const guilds = chunk(
            Array.from(
                this.client.guilds.cache
                    .filter((g) => g.members.cache.has(interaction.user.id))
                    .values()
            ),
            3
        );

        let num = 0;
        const pages: MessageEmbed[] = [];

        /* Create the embed pages */
        for (let i = 0; i < guilds.length; i++) {
            const guild = guilds[i];

            const embed = new MessageEmbed()
                .setColor('BLURPLE')
                .setTitle('Select server.')
                .setDescription('Select the server you want to create mail to.')
                .setFooter({ text: `Page: ${i + 1} / ${guilds.length}` });

            for (let j = 0; j < guild.length; j++) {
                const g = guild[j];

                embed.addField(`${j + 1}. ${g.name}`, g.id);
            }
            pages.push(embed);
        }

        this.client._cachedMails.add(interaction.user.id);

        await interaction.deferReply();
        const msg = (await interaction.editReply({
            embeds: [pages[num]],
        })) as Message;

        await msg.react('◀️');
        await msg.react('▶️');
        await msg.react('1️⃣');
        await msg.react('2️⃣');
        await msg.react('3️⃣');

        const filter = (_: MessageReaction, user: User) =>
            user.id == interaction.user.id;
        const collector = msg.createReactionCollector({
            filter,
            time: 60 * 1000,
        });

        collector.on('collect', async (r) => {
            const icon = emoji.find(r.emoji.name as string);
            const index = numberify(icon.key);

            if (typeof index == 'number') {
                const guild = guilds[num][index - 1];

                const doc = await MailModel.findOne({
                    guild: guild.id,
                    user: interaction.user.id,
                });

                /* Checking if mail ticket channel was deleted manually */
                if (doc) {
                    const channel = this.client.channels.cache.get(doc.id);

                    if (!channel) {
                        await doc.delete();
                    } else {
                        await interaction.followUp({
                            content:
                                'You already have a mail ticket in this guild!',
                            ephemeral: true,
                        });

                        await interaction.deleteReply();

                        return collector.stop();
                    }
                }

                /* Creating the mail ticket channel */
                try {
                    const channel = await guild.channels.create('modmail', {
                        type: 'GUILD_TEXT',
                        permissionOverwrites: [
                            {
                                allow: Permissions.FLAGS.VIEW_CHANNEL,
                                id: interaction.user.id,
                            },
                            {
                                deny: Permissions.FLAGS.VIEW_CHANNEL,
                                id: guild.id,
                            },
                        ],
                    });

                    const doc = new MailModel({
                        id: channel?.id,
                        guild: guild.id,
                        user: interaction.user.id,
                    });

                    await channel?.send({
                        content: `<@${interaction.user.id}>`,
                        embeds: [
                            new MessageEmbed()
                                .setColor('BLURPLE')
                                .setDescription(
                                    [
                                        'Support will be with you shortly.',
                                        reason
                                            ? '**Reason: **' +
                                              reason.substring(0, 1000)
                                            : '',
                                    ].join('\n')
                                ),
                        ],
                    });

                    await doc.save();

                    await interaction.followUp({
                        content: `Your mail ticket was created in **${guild.name}**!`,
                        ephemeral: true,
                    });

                    await interaction.deleteReply();
                } catch (error) {
                    await interaction.followUp({
                        content:
                            'There was an error creating your mail ticket.',
                        ephemeral: true,
                    });

                    await interaction.deleteReply();

                    console.error(error);
                }

                return collector.stop();
            }

            /* Managing star pages */
            if (r.emoji.name == '▶️' && num < pages.length - 1) {
                num += 1;
            } else if (r.emoji.name == '◀️' && num > 0) {
                num -= 1;
            }

            await interaction.editReply({ embeds: [pages[num]] });
        });

        collector.on('end', async (_, reason) => {
            this.client._cachedMails.delete(interaction.user.id);

            if (reason == 'time') {
                await interaction.followUp({
                    content: 'Your time ran out. You took too long!',
                    ephemeral: true,
                });

                await interaction.deleteReply();
            }
        });
    }
}
