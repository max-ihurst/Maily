import { SlashCommandBuilder } from '@discordjs/builders';

export const PingCommand = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Pong!')