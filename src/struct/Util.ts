import {
    Client,
    Collection,
    GuildMember,
    Message,
    MessageEditOptions,
    PermissionResolvable,
    User,
} from 'discord.js';

import { Guild } from '../types/types';
import Command from '../Command';
import Constants from '../Constants';

export default class Utilities {
    public client: Client;

    public constructor(client: Client) {
        this.client = client;
    }

    public hasAccess(settings: Guild, member: GuildMember): number {
        if (
            member.permissions.has(
                Constants.DEFAULT_PERMISSION as PermissionResolvable
            )
        ) {
            return 1;
        } else if (settings.access) {
            if (member.roles.cache.has(settings.access)) {
                return 1;
            }
        }

        return 0;
    }

    public cooldown(command: Command, user: User): number | null {
        const now = Date.now();
        let timestamps = this.client.cooldowns.get(command.name);

        if (!timestamps) {
            this.client.cooldowns.set(command.name, new Collection());
            timestamps = this.client.cooldowns.get(command.name);
        }

        const cooldown = (command.cooldown || 0) * 1000;

        if (timestamps?.has(user.id)) {
            const expiration = (timestamps.get(user.id) as number) + cooldown;

            if (now < expiration) {
                const time = (expiration - now) / 1000;
                return time;
            }
        } else {
            timestamps?.set(user.id, now);
            setTimeout(() => timestamps?.delete(user.id), cooldown);
        }

        return null;
    }

    public async edit(
        message: Message,
        options: MessageEditOptions
    ): Promise<Message> {
        return await message.edit({
            content: options.content ?? message.content,
            embeds: options.embeds ?? message.embeds,
            components: options.components ?? message.components,
        });
    }
}
