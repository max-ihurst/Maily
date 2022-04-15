import { SlashCommandBuilder } from '@discordjs/builders';
import { ChannelType } from 'discord-api-types/v9';

export const SettingsCommand = new SlashCommandBuilder()
    .setName('settings')
    .setDescription('Send to configurate my settings!')
    .addSubcommand((command) =>
        command
            .setName('access-role')
            .setDescription('Set the default role access to mail ticket.')
            .addRoleOption((option) =>
                option
                    .setName('role')
                    .setDescription('The role to be accessed to mail tickets.')
                    .setRequired(true)
            )
    )
    .addSubcommand((command) =>
        command
            .setName('category')
            .setDescription(
                'Set the category in which mail tickets are created into.'
            )
            .addChannelOption((option) =>
                option
                    .setName('category')
                    .setDescription('The mail ticket category.')
                    .addChannelType(ChannelType.GuildCategory as number)
                    .setRequired(true)
            )
    );
