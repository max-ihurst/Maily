import {
    GuildMember,
    Message,
    MessageEditOptions,
    PermissionResolvable,
} from 'discord.js';

import { Guild } from '../types/types';
import Constants from '../Constants';

export default class Utilities {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public constructor() {}

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
