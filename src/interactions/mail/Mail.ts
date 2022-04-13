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
    )
    .addSubcommand((command) =>
        command.setName('close').setDescription('Send to close a mail ticket.')
    )
    .addSubcommand((command) =>
        command
            .setName('lock')
            .setDescription(
                'Locks the ticket mail from the creator and other accessed users.'
            )
    )
    .addSubcommand((command) =>
        command.setName('unlock').setDescription('Unlocks the mail ticket!')
    );
