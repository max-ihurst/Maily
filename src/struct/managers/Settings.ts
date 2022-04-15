import { Collection } from 'discord.js';
import GuildModel from '../../models/Guild';
import { Guild, Settings } from '../../types/types';

export default class SettingsManager {
    public cache: Collection<string, Guild>;

    public constructor() {
        this.cache = new Collection();

        this.init();
    }

    public async set(id: string, key: Settings, value: any): Promise<void> {
        let doc = await GuildModel.findOne({ id });

        if (!doc) {
            doc = new GuildModel({ id });
        }

        doc.set(key, value);
        await doc.save();
        this.cache.set(doc.id, doc);
    }

    public async delete(id: string, key: Settings): Promise<void> {
        const doc = await GuildModel.findOne({ id });

        if (doc) {
            doc.set(key, undefined, { strict: false });
            await doc.save();
            this.cache.set(doc.id, doc);
        }
    }

    public async increment(id: string, key: Settings): Promise<void> {
        let doc = await GuildModel.findOne({ id });

        if (!doc) {
            doc = new GuildModel({ id });
        }

        doc.set(key, Number(doc[key]) + 1);
        await doc.save();
        this.cache.set(doc.id, doc);
    }

    public async init(): Promise<void> {
        const docs = await GuildModel.find();
        for (const doc of docs) {
            this.cache.set(doc.id, doc);
        }
    }
}
