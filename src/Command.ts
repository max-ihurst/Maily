import { CommandInteraction, PermissionResolvable } from 'discord.js';

export default interface Command {
    name: string;
    guildOnly?: boolean;
    permissions?: PermissionResolvable[];
    execute(interaction: CommandInteraction): Promise<void> | void;
}
