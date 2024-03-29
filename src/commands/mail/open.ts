import {
    CommandInteraction,
    CacheType,
    Client,
    MessageEmbed,
    Message,
    User,
    MessageReaction,
    Permissions,
    MessageActionRow,
    MessageButton,
    DiscordAPIError,
} from 'discord.js';

import Constants from '../../Constants';
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
        const guilds = Array.from(this.client.guilds.cache.values());
        for (const guild of guilds) {
            try {
                await guild.members.fetch({ user: interaction.user.id });
            } catch (error) {
                if (error instanceof DiscordAPIError) {
                    if (error.httpStatus != 404) {
                        console.error(error);
                    }
                } else {
                    console.error(error);
                }
            }
        }

        const chunks = chunk(
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
        for (let i = 0; i < chunks.length; i++) {
            const guilds = chunks[i];

            const embed = new MessageEmbed()
                .setColor(Constants.EMBED_COLOR)
                .setTitle('Select server.')
                .setDescription('Select the server you want to create mail to.')
                .setFooter({ text: `Page: ${i + 1} / ${chunks.length}` });

            for (let j = 0; j < guilds.length; j++) {
                const guild = guilds[j];

                embed.addField(`${j + 1}. ${guild.name}`, guild.id);
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

        const index = ['1️⃣', '2️⃣', '3️⃣'];
        for (let i = 0; i < chunks[0].length; i++) {
            await msg.react(index[i]);
        }

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
                const guild = chunks[num][index - 1];
                if (!guild) return;

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

                const settings = this.client.settings.cache.get(guild.id);

                const permissions = [
                    {
                        allow: Permissions.FLAGS.VIEW_CHANNEL,
                        id: interaction.user.id,
                    },
                    {
                        deny: Permissions.FLAGS.VIEW_CHANNEL,
                        id: guild.id,
                    },
                    {
                        allow: Permissions.FLAGS.SEND_MESSAGES,
                        id: this.client.user?.id as string,
                    },
                ];

                const category = guild.channels.cache.get(
                    settings?.parent as string
                );

                if (settings?.access) {
                    const role = guild?.roles.cache.get(settings.access);

                    if (role) {
                        permissions.push({
                            allow: Permissions.FLAGS.VIEW_CHANNEL,
                            id: role.id,
                        });
                    }
                }

                /* Creating the mail ticket channel */
                try {
                    await this.client.settings.increment(guild.id, 'mail');

                    const channel = await guild.channels.create(
                        interaction.user.username +
                            '-' +
                            String(settings?.mail ?? 1).padStart(4, '0'),
                        {
                            type: 'GUILD_TEXT',
                            parent: category ? category.id : undefined,
                            permissionOverwrites: permissions,
                        }
                    );

                    const doc = new MailModel({
                        id: channel?.id,
                        guild: guild.id,
                        user: interaction.user.id,
                    });

                    await interaction.followUp({
                        content: `Your mail ticket was created in **${guild.name}**! (<#${channel.id}>)`,
                        ephemeral: true,
                    });

                    const embed = new MessageEmbed()
                        .setColor(Constants.EMBED_COLOR)
                        .setTimestamp()
                        .setDescription(
                            settings?.message
                                ? settings.message
                                      .substring(0, 4096)
                                      .replace(
                                          '{user}',
                                          `<@${interaction.user.id}>`
                                      )
                                : Constants.DEFAULT_MESSAGE
                        );

                    if (reason) {
                        embed.addField('Reason', reason.substring(0, 1024));
                    }

                    try {
                        const message = await channel?.send({
                            content: `<@${interaction.user.id}>`,
                            embeds: [embed],
                            components: [
                                new MessageActionRow().addComponents([
                                    new MessageButton()
                                        .setCustomId('LOCK')
                                        .setStyle('SECONDARY')
                                        .setLabel('🔒 Lock'),
                                    new MessageButton()
                                        .setCustomId('CLOSE')
                                        .setStyle('SECONDARY')
                                        .setLabel('❌ Close'),
                                    new MessageButton()
                                        .setCustomId('TRANSCRIPT')
                                        .setStyle('SECONDARY')
                                        .setLabel('📄 Transcript'),
                                ]),
                            ],
                        });

                        doc.panel = message.id;

                        // eslint-disable-next-line no-empty
                    } catch {}

                    await doc.save();

                    await interaction.deleteReply();
                } catch (error) {
                    if (error instanceof DiscordAPIError) {
                        if (error.httpStatus == 403) {
                            if (
                                !guild.me?.permissions.has([
                                    Permissions.FLAGS.MANAGE_CHANNELS,
                                    Permissions.FLAGS.SEND_MESSAGES,
                                ])
                            ) {
                                await interaction.followUp({
                                    content: [
                                        'I seem to be missing permissions to create your mail ticket.',
                                        'I muse require permissions `MANAGE_CHANNELS` and `SEND_MESSAGES`',
                                    ].join('\n'),
                                    ephemeral: true,
                                });
                            } else {
                                await interaction.followUp({
                                    content:
                                        'I seem to be having an issue with hierarchical permissions.',
                                    ephemeral: true,
                                });
                            }
                        } else {
                            await interaction.followUp({
                                content:
                                    'There was an unkown error running this command!',
                                ephemeral: true,
                            });

                            console.error(error);
                        }
                    }

                    await interaction.deleteReply();
                }

                return collector.stop();
            }

            /* Managing embed pages */
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
