import { Request, SearchRequest } from 'stremio-addons';
interface Options {
    idProperty: string;
    cache?: boolean;
}
declare class Mixer {
    private client;
    private idProperty;
    private cache;
    constructor(options: Options);
    private _validateResponse(res);
    private _transformChannel(channel);
    private _getTypeId(typeName);
    findChannels(request: Request | SearchRequest): Promise<{
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
