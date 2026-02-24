import mongoose, { type CallbackWithoutResultAndOptionalError } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        versionKey: false,
        timestamps: true,
    }
);

// Hash password sebelum disimpan
UserSchema.pre('save', function (this: IUser, next: CallbackWithoutResultAndOptionalError) {
    if (!this.isModified('password')) return next();
    const self = this;
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next(err);
        bcrypt.hash(self.password, salt, (hashErr, hash) => {
            if (hashErr) return next(hashErr);
            self.password = hash;
            next();
        });
    });
});

// Method untuk compare password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password as string);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);
