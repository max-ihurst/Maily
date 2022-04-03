import { CommandInteraction } from "discord.js";

export default interface Command {
    name: string;
    execute(interaction: CommandInteraction): Promise<void> | void;
}