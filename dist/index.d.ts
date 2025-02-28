import { Config } from 'payload/config';
export declare const secondaryDBPlugin: ({ collections, secondDBUrl }: {
    secondDBUrl: string;
    collections: string[];
}) => (config: Config) => Promise<Config>;
