import * as mongoose from 'mongoose';
import { Mail } from '../types/types';

export default mongoose.model<Mail>(
    'mail',
    new mongoose.Schema<Mail>({
        id: {
            type: String,
            required: true,
        },
        panel: {
            type: String,
            required: false,
        },
        guild: {
            type: String,
            required: true,
        },
        user: {
            type: String,
            required: true,
        },
        claimer: {
            type: String,
            required: false,
        },
    })
);
