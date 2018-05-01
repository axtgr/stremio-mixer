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

const CHANNEL_FIELDS = 'id,token,name,viewersCurrent,type,bannerUrl,thumbnail'
const ID_PROPERTY = 'mixer_id'

class Mixer {
  private client = new Client(new DefaultRequestRunner())

  private _transformChannel(channel: Channel) {
    let url = `https://mixer.com/${channel.token}`
    let thumbnailUrl

    if (channel.thumbnail) {
      thumbnailUrl = channel.thumbnail.url
    } else {
      thumbnailUrl = `https://thumbs.mixer.com/channel/${channel.id}.small.jpg`
    }

    return {
      id: `${ID_PROPERTY}:${channel.id}`,
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
    let options = {
      qs: {
        fields: 'id',
        where: `name:eq:${typeName}`,
      },
    }

    let res = await this.client.request('GET', 'types', options)
    return res.body ? (res.body as any[])[0].id : undefined
  }

  async findChannels(request: Request | SearchRequest) {
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
    let results = res.body as Channel[] | undefined
    return results ? results.map((item) => this._transformChannel(item)) : []
  }

  async getChannel(req: Request) {
    let id = req.query[ID_PROPERTY]
    let options = {
      qs: {
        fields: CHANNEL_FIELDS,
      },
    }

    let res = await this.client.request('GET', `channels/${id}`, options)
    let result = res.body as Channel | undefined
    return result ? this._transformChannel(result) : undefined
  }

  async getStreams(req: Request) {
    let id = req.query[ID_PROPERTY]
    let url = this.client.buildAddress(
      this.client.urls.api,
      `channels/${id}/manifest.m3u8`
    )

    return [
      {
        url,
        [ID_PROPERTY]: id,
        title: 'Watch',
        tags: ['hls'],
        isFree: true,
      },
    ]
  }
}

export default Mixer
export { ID_PROPERTY }
