import * as mongoose from 'mongoose';
import { Guild } from '../types/types';

export default mongoose.model<Guild>(
    'guild',
    new mongoose.Schema<Guild>({
        id: {
            type: String,
            required: true,
        },
        mail: {
            type: Number,
            default: 0,
            required: true,
        },
        parent: {
            type: String,
            required: false,
        },
        access: {
            type: String,
            required: false,
        },
        message: {
            type: String,
            required: false,
        },
    })
);
