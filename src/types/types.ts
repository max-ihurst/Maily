export interface Mail {
    id: string;
    message: string;
    guild: string;
    user: string;
}

export interface Guild {
    id: string;
    access: string;
}

export type Settings = 'access';
