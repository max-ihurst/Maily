import { Client } from 'discord.js';
import Event from '../Event';

export default class ReadyEvent implements Event {
    public client: Client;
    public name = 'ready';
    public once = true;

    public constructor(client: Client) {
        this.client = client;
    }

    public execute(): void {
        setInterval(async () => {
            const mails = Array.from(
                this.client.settings.cache.values()
            ).reduce((accumulator, guild) => {
                return accumulator + guild.mail;
            }, 0);

            await this.client.user?.setActivity(`to ${mails} mails`, {
                type: 'LISTENING',
            });
        }, 60000);
    }
}
