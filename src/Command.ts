import { CommandInteraction } from 'discord.js';

export default interface Command {
    name: string;
    cooldown?: number;
    execute(interaction: CommandInteraction): Promise<void> | void;
}
