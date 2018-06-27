import { Request, SearchRequest } from 'stremio-addons';
interface Options {
    clientId: string;
    idProperty: string;
    cache?: boolean;
}
declare class Mixer {
    private client;
    private clientId;
    private idProperty;
    private cache;
    constructor(options: Options);
    private _validateResponse;
    private _transformChannel;
    private _getTypeId;
    findChannels(req: Request | SearchRequest): Promise<{
        id: string;
        name: string;
        description: string;
        genre: string[] | undefined;
        website: string;
        populartiy: number;
        poster: string;
        posterShape: string;
        banner: string;
        type: string;
    }[]>;
    getChannel(req: Request): Promise<{
        id: string;
        name: string;
        description: string;
        genre: string[] | undefined;
        website: string;
        populartiy: number;
        poster: string;
        posterShape: string;
        banner: string;
        type: string;
    } | undefined>;
    getStreams(req: Request): Promise<{
        [x: string]: any;
        url: string;
        title: string;
        tags: string[];
        isFree: boolean;
        availability: number;
    }[]>;
}
export { Mixer as default, Options };
