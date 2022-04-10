import { SlashCommandBuilder } from '@discordjs/builders';

export const MailCommand = new SlashCommandBuilder()
    .setName('mail')
    .setDescription('Mail command.')
    .addSubcommand((command) =>
        command
            .setName('open')
            .setDescription('Send to open a mail ticket in a server.')
            .addStringOption((option) =>
                option
                    .setName('reason')
                    .setDescription('The reason for opening the mail ticket.')
            )
    );
