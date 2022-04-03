import { Client, Collection } from 'discord.js';
import * as recursive from 'recursive-readdir';
import * as path from 'path';
import Command from '../Command';

export default class CommandHandler {
    public modules: Collection<string, Command>;
    public client: Client;

    public constructor(client: Client) {
        this.modules = new Collection();
        this.client = client;

        this.init();
    }

    public async init() {
        const files = await recursive('./src/commands');

        for (const file of files) {
            let command = (await import(path.resolve(file))).default;
            command = new command(this.client);
            this.modules.set(command.name, command);
        }
    }
}