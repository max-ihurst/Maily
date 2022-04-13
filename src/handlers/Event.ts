import { Client, Collection } from 'discord.js';
import * as recursive from 'recursive-readdir';
import * as path from 'path';
import Event from '../Event';

export default class EventHandler {
    public modules: Collection<string, Event>;
    public client: Client;

    public constructor(client: Client) {
        this.modules = new Collection();
        this.client = client;

        this.init();
    }

    public async init() {
        const files = await recursive('./src/events');

        for (const file of files) {
            let event = (await import(path.resolve(file))).default;
            event = new event(this.client);
            event.client = this.client;

            if (event.once) {
                this.client.once(event.name, event.execute.bind(event));
            } else {
                this.client.on(event.name, event.execute.bind(event));
            }

            this.modules.set(event.name, event);
        }
    }
}
