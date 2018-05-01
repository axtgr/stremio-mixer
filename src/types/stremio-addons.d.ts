declare module 'stremio-addons' {
  interface GenericRequest {
    query: any
    limit: number
    skip: number
  }

  interface Request extends GenericRequest {
    query: {
      [key: string]: any
    },
  }

  interface SearchRequest extends GenericRequest {
    query: string
  }

  interface Method<R extends object> {
    (req: Request | SearchRequest, cb: (err: Error | null, res?: R) => void): void
  }

  interface Methods {
    'meta.find'?: Method<object>
    'meta.search'?: Method<object>
    'meta.get'?: Method<object>
    'meta.genres'?: Method<object>
    'stream.find'?: Method<object>
    'subtitles.find'?: Method<object>
  }

  class Server {
    constructor(methods: Methods, manifest: any)
    middleware(req: any, res: any, cb: Function): void
  }
}
