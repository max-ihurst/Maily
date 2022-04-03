import {CommandInteraction, CacheType, Client} from 'discord.js';
import Command from '../Command';

export default class PingCommand implements Command {
    public client: Client;
    public name = 'ping';

    public constructor(client: Client) {
        this.client = client;
    }

    public execute(interaction: CommandInteraction<CacheType>): void {
        interaction.reply('Pong!');
    }
}