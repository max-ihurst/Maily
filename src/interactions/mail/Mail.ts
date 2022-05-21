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
        command
            .setName('close')
            .setDescription('Send to close a mail ticket.')
    )
    .addSubcommand((command) =>
        command
            .setName('transcript')
            .setDescription('Send to create a transcript of the mail ticket.')
    )
    .addSubcommand((command) =>
        command
            .setName('lock')
            .setDescription('Locks the ticket mail from the creator and other accessed users.')
    )
    .addSubcommand((command) =>
        command
            .setName('unlock')
            .setDescription('Unlocks the mail ticket!')
    )
    .addSubcommand((command) =>
        command
            .setName('add')
            .setDescription('Adds a user to interact in the mail ticket.')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setDescription('The user to add to the mail ticket.')
                    .setRequired(true)
            )
    )
    .addSubcommand((command) =>
        command
            .setName('remove')
            .setDescription('Remove a user from interacting within the mail ticket.')
            .addUserOption((option) =>
                option
                    .setName('user')
                    .setDescription('The user to remove from the mail ticket.')
                    .setRequired(true)
            )
    )
    .addSubcommand((command) =>
        command
            .setName('claim')
            .setDescription('Claim a ticket to a single mail ticket accessor.')
    )
    .addSubcommand((command) =>
        command
            .setName('unclaim')
            .setDescription('Unclaim a ticket to restore all the access users.')
    );
