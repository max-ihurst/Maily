import { SlashCommandBuilder } from '@discordjs/builders';

export const SettingsCommand = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Send to configurate my settings!')
    .addSubcommand((command) =>
        command
            .setName('access-role')
            .setDescription('Set the default role access to mail ticket.')
            .addRoleOption((role) =>
                role
                    .setName('role')
                    .setDescription('The role to be accessed to mail tickets.')
                    .setRequired(true)
            )
    );
