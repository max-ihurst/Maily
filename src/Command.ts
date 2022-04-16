import { CommandInteraction } from 'discord.js';

export default interface Command {
    name: string;
    guildOnly?: boolean;
    execute(interaction: CommandInteraction): Promise<void> | void;
}
