import {
    CommandInteraction,
    CacheType,
    Client,
    Permissions,
    MessageAttachment,
} from 'discord.js';

import MailModel from '../../models/Mails';
import Command from '../../Command';
import { hyperlink } from '@discordjs/builders';
import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import * as fs from 'fs/promises';
import 'dotenv/config';

const dom = new JSDOM();
const document = dom.window.document;

export default class MailTranscriptCommand implements Command {
    public client: Client;
    public name = 'transcript';

    public constructor(client: Client) {
        this.client = client;
    }

    public async execute(
        interaction: CommandInteraction<CacheType>
    ): Promise<void> {
        const doc = await MailModel.findOne({ id: interaction.channel?.id });

        if (!doc) {
            return await interaction.reply({
                content: 'This command must be ran in a mail ticket.',
                ephemeral: true,
            });
        }

        const uri = 'https://top.gg/api/bots/961730965254860820/check?userId=';
        const responce = await fetch(uri + interaction.user.id, {
            method: 'get',
            headers: {
                Authorization: process.env.TOPGG_API as string,
            },
        });

        const body = await responce.json();

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
            !interaction.guild?.me?.permissions.has(
                Permissions.FLAGS.ATTACH_FILES
            )
        ) {
            return await interaction.reply({
                content: 'I seem to be missing permissions to `ATTACH_FILES`',
            });
        } else if (!body.voted) {
            return await interaction.reply({
                content: `You need to vote at ${hyperlink(
                    'top.gg',
                    '<https://top.gg/bot/961730965254860820>'
                )} to gain access to this command.`,
                ephemeral: true,
            });
        }

        try {
            const messages = await interaction.channel?.messages.fetch({
                limit: 100,
            });

            const msgs = messages?.reverse();

            const data = await fs.readFile('./src/template.html', 'utf8');

            if (data) {
                await fs.writeFile('transcript.html', data);

                msgs?.forEach(async (msg) => {
                    const parent = document.createElement('div');
                    parent.className = 'parent-container';

                    const avatar = document.createElement('div');
                    avatar.className = 'avatar-container';
                    const img = document.createElement('img');
                    img.setAttribute('src', msg.author.displayAvatarURL());
                    img.className = 'avatar';
                    avatar.appendChild(img);

                    parent.appendChild(avatar);

                    const message = document.createElement('div');
                    message.className = 'message-container';

                    const nameElement = document.createElement('span');
                    const name = document.createTextNode(
                        [
                            msg.author.tag,
                            msg.createdAt.toDateString(),
                            msg.createdAt.toLocaleTimeString(),
                            ' GMT',
                        ].join(' ')
                    );
                    nameElement.appendChild(name);
                    message.append(nameElement);

                    const msgNode = document.createElement('span');
                    const textNode = document.createTextNode(msg.content);
                    msgNode.append(textNode);
                    message.appendChild(msgNode);

                    parent.appendChild(message);
                    await fs.appendFile('transcript.html', parent.outerHTML);
                });

                await interaction.reply({
                    content: 'Here is a transcript of this mail ticket:',
                    files: [new MessageAttachment('./transcript.html')],
                    ephemeral: true,
                });
            }
        } catch (error) {
            console.log(error);

            return interaction.reply({
                content:
                    'There has been an unknown error while creating the ticket transcript.',
                ephemeral: true,
            });
        }
    }
}
