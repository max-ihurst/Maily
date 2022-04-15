export interface Mail {
    id: string;
    message: string;
    guild: string;
    user: string;
}

export interface Guild {
    id: string;
    mail: number;
    parent: string;
    access: string;
}

export type Settings = 'access' | 'parent' | 'mail';
