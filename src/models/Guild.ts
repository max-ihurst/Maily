import * as mongoose from 'mongoose';
import { Guild } from '../types/types';

export default mongoose.model<Guild>(
    'guild',
    new mongoose.Schema<Guild>({
        id: {
            type: String,
            required: true,
        },
        access: {
            type: String,
            required: false,
        },
    })
);
