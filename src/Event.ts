export default interface Listener {
    name: string;
    once?: boolean;
    execute(...args: any): void | Promise<void>;
}
