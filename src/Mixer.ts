// Docs: https://dev.mixer.com/rest.html

import {
  Client,
  DefaultRequestRunner,
  IChannel,
  IResponse,
} from 'beam-client-node'
import { Request, SearchRequest } from 'stremio-addons'

type Channel = IChannel & {
  thumbnail: {
    url: string
  }
}

interface Options {
  idProperty: string
}

const CHANNEL_FIELDS = 'id,token,name,viewersCurrent,type,bannerUrl,thumbnail'

class Mixer {
  private client = new Client(new DefaultRequestRunner())
  private idProperty: string

  constructor(options: Options) {
    this.idProperty = options.idProperty
  }

  private _validateResponse(res: IResponse<any>) {
    let { body, statusCode } = res

    if (body && body.error) {
      throw new Error(`${body.statusCode} ${body.error}: ${body.message}`)
    }

    if (statusCode >= 400) {
      throw new Error(`Error ${statusCode}`)
    }
  }

  private _transformChannel(channel: Channel) {
    // https://github.com/Stremio/stremio-addons/blob/master/docs/api/meta/meta.element.md

    let url = `https://mixer.com/${channel.token}`
    let thumbnailUrl

    if (channel.thumbnail) {
      thumbnailUrl = channel.thumbnail.url
    } else {
      thumbnailUrl = `https://thumbs.mixer.com/channel/${channel.id}.small.jpg`
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
    }
  }

  private async _getTypeId(typeName: string): Promise<number | undefined> {
    // https://dev.mixer.com/rest.html#types_get

    let options = {
      qs: {
        fields: 'id',
        where: `name:eq:${typeName}`,
      },
    }

    let res = await this.client.request('GET', 'types', options)
    this._validateResponse(res)
    return res.body ? (res.body as any[])[0].id : undefined
  }

  async findChannels(request: Request | SearchRequest) {
    // https://dev.mixer.com/rest.html#channels_get
    // Limited by the "channel-search" bucket to 20 requests per 5 seconds

    // We assume that skip is a multiple of limit, so pagination is simplified
    let { query, skip = 0, limit = 100 } = request
    let qs: any = {
      limit,
      page: Math.ceil(skip / limit) || 0,
      fields: CHANNEL_FIELDS,
    }

    if (typeof query === 'string') {
      qs.scope = 'names'
      qs.q = query
    } else if (query.genre) {
      let typeId = await this._getTypeId(query.genre)

      if (!typeId) {
        return []
      }

      qs.order = 'viewersCurrent:DESC'
      qs.where = `typeId:eq:${typeId}`
    }

    let res = await this.client.request('GET', 'channels', { qs })
    this._validateResponse(res)
    let results = res.body as Channel[] | undefined
    return results ? results.map((item) => this._transformChannel(item)) : []
  }

  async getChannel(req: Request) {
    // https://dev.mixer.com/rest.html#channels__channelIdOrToken__get
    // Limited by the "channel-read" bucket to 1000 requests per 300 seconds

    let id = req.query[this.idProperty]
    let options = {
      qs: {
        fields: CHANNEL_FIELDS,
      },
    }

    let res = await this.client.request('GET', `channels/${id}`, options)
    this._validateResponse(res)
    let result = res.body as Channel | undefined
    return result ? this._transformChannel(result) : undefined
  }

  async getStreams(req: Request) {
    // https://dev.mixer.com/rest.html#channels__channelId__manifest_m3u8_get

    let id = req.query[this.idProperty]
    let url = this.client.buildAddress(
      this.client.urls.api,
      `channels/${id}/manifest.m3u8`
    )

    return [
      {
        url,
        [this.idProperty]: id,
        title: 'Watch',
        tags: ['hls'],
        isFree: true,
      },
    ]
  }
}

export { Mixer as default, Options }
