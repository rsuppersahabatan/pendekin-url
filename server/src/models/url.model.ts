import mongoose from 'mongoose';

export interface IURL extends mongoose.Document {
    urlCode: string;
    longUrl: string;
    shortUrl: string;
    date: string;
}

const URLSchema = new mongoose.Schema({
    urlCode: {
        type: String,
        required: true,
        unique: true
    },
    longUrl: {
        type: String,
        required: true
    },
    shortUrl: {
        type: String,
        required: true
    },
    date: {
        type: String,
        default: () => Date.now().toString()
    }
},
    {
        versionKey: false,
        timestamps: false,
    }
);

export const URLModel = mongoose.model<IURL>('Url', URLSchema);
