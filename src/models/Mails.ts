import * as mongoose from 'mongoose';
import { Mail } from '../types/types';

export default mongoose.model<Mail>(
    'mail',
    new mongoose.Schema<Mail>({
        id: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        guild: {
            type: String,
            required: true,
        },
        user: {
            type: String,
            required: true,
        },
    })
);
