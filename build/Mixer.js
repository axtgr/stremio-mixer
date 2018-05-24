"use strict";
// Docs: https://dev.mixer.com/rest.html
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const beam_client_node_1 = require("beam-client-node");
const NodeCache = require("node-cache");
const CHANNEL_FIELDS = 'id,token,name,viewersCurrent,type,bannerUrl,thumbnail';
const CACHE_TTLS = {
    _getTypeId: 60 * 60,
    findChannels: 5 * 60,
    getChannel: 5 * 60,
};
function cacheable(ttl) {
    return function cacheableDecorator(target, methodName, descriptor) {
        let rawMethod = descriptor.value;
        descriptor.value = function cachedMethod(arg) {
            if (!this.cache) {
                return rawMethod.call(this, arg);
            }
            let key = `${methodName}:${JSON.stringify(arg)}`;
            let result = this.cache.get(key);
            if (result) {
                return Promise.resolve(result);
            }
            return rawMethod.call(this, arg).then((result) => {
                this.cache.set(key, result, ttl);
                return result;
            });
        };
    };
}
class Mixer {
    constructor(options) {
        this.client = new beam_client_node_1.Client(new beam_client_node_1.DefaultRequestRunner());
        this.clientId = options.clientId;
        this.idProperty = options.idProperty;
        if (options.cache) {
            this.cache = new NodeCache({ checkperiod: 3 * 60 });
        }
    }
    _validateResponse(res) {
        let { body, statusCode } = res;
        if (body && body.error) {
            throw new Error(`${body.statusCode} ${body.error}: ${body.message}`);
        }
        if (statusCode >= 400) {
            throw new Error(`Error ${statusCode}`);
        }
    }
    _transformChannel(channel) {
        // https://github.com/Stremio/stremio-addons/blob/master/docs/api/meta/meta.element.md
        let url = `https://mixer.com/${channel.token}`;
        let thumbnailUrl;
        if (channel.thumbnail) {
            thumbnailUrl = channel.thumbnail.url;
        }
        else {
            thumbnailUrl = `https://thumbs.mixer.com/channel/${channel.id}.small.jpg`;
        }
        return {
            id: `${this.idProperty}:${channel.id}`,
            name: channel.token,
            description: `${channel.name}\n\n${url}`,
            genre: channel.type ? [channel.type.name] : undefined,
            website: url,
            populartiy: channel.viewersCurrent,
            poster: thumbnailUrl,
            posterShape: 'landscape',
            banner: channel.bannerUrl || thumbnailUrl,
            type: 'tv',
        };
    }
    _getTypeId(typeName) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://dev.mixer.com/rest.html#types_get
            let options = {
                headers: { 'Client-ID': this.clientId },
                qs: {
                    fields: 'id',
                    where: `name:eq:${typeName}`,
                },
            };
            let res = yield this.client.request('GET', 'types', options);
            this._validateResponse(res);
            let body = res.body;
            return body && body[0] && body[0].id;
        });
    }
    findChannels(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://dev.mixer.com/rest.html#channels_get
            // Limited by the "channel-search" bucket to 20 requests per 5 seconds
            if (!req.query) {
                return [];
            }
            // We assume that skip is a multiple of limit, so pagination is simplified
            let { query, skip = 0, limit = 100 } = req;
            let headers = { 'Client-ID': this.clientId };
            let qs = {
                limit,
                page: Math.ceil(skip / limit) || 0,
                fields: CHANNEL_FIELDS,
            };
            if (typeof query === 'string') {
                qs.scope = 'names';
                qs.q = query;
            }
            else if (query.genre) {
                let typeId = yield this._getTypeId(query.genre);
                if (!typeId) {
                    return [];
                }
                qs.order = 'viewersCurrent:DESC';
                qs.where = `typeId:eq:${typeId}`;
            }
            let res = yield this.client.request('GET', 'channels', { qs, headers });
            this._validateResponse(res);
            let results = res.body;
            return results ? results.map((item) => this._transformChannel(item)) : [];
        });
    }
    getChannel(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://dev.mixer.com/rest.html#channels__channelIdOrToken__get
            // Limited by the "channel-read" bucket to 1000 requests per 300 seconds
            if (!req.query) {
                return;
            }
            let id = req.query[this.idProperty];
            let options = {
                headers: { 'Client-ID': this.clientId },
                qs: {
                    fields: CHANNEL_FIELDS,
                },
            };
            let res = yield this.client.request('GET', `channels/${id}`, options);
            this._validateResponse(res);
            let result = res.body;
            return result ? this._transformChannel(result) : undefined;
        });
    }
    getStreams(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://dev.mixer.com/rest.html#channels__channelId__manifest_m3u8_get
            if (!req.query) {
                return [];
            }
            let id = req.query[this.idProperty];
            let url = this.client.buildAddress(this.client.urls.api, `channels/${id}/manifest.m3u8`);
            return [
                {
                    url,
                    [this.idProperty]: id,
                    title: 'Watch',
                    tags: ['hls'],
                    isFree: true,
                    availability: 2,
                },
            ];
        });
    }
}
__decorate([
    cacheable(CACHE_TTLS._getTypeId)
], Mixer.prototype, "_getTypeId", null);
__decorate([
    cacheable(CACHE_TTLS.findChannels)
], Mixer.prototype, "findChannels", null);
__decorate([
    cacheable(CACHE_TTLS.getChannel)
], Mixer.prototype, "getChannel", null);
exports.default = Mixer;
//# sourceMappingURL=Mixer.js.map