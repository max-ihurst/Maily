export interface Mail {
    id: string;
    panel: string;
    guild: string;
    user: string;
    claimer: string;
}

export interface Guild {
    id: string;
    mail: number;
    parent: string;
    access: string;
    message: string;
}

export type Settings = 'access' | 'parent' | 'message' | 'mail';
