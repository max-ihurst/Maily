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
            doc = new GuildModel({
                id,
            });
        }

        doc.set(key, value);
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