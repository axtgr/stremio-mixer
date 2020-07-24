![stremio-mixer](/public/logo_readme.png)

---

🏆 __[Third-place winner in Stremio Add-On Contest](http://blog.stremio.com/stremio-addon-contest-winners)__ 🎉

---

__DEPRECATED:__ As of July 22 2020, Microsoft has closed Mixer.

This is a [Stremio](https://www.stremio.com/) add-on with live broadcasts from Microsoft's innovative streaming platform, [Mixer](https://mixer.com/).

It is a node.js app written in TypeScript that retrieves stream URLs from Mixer using its REST API and provides them to Stremio. Supports in-memory caching and different levels of logging. Can be configured using environment variables and run in Docker.


## Registration

Starting May 21<sup>st</sup> 2018 in order for this add-on to work, you need to provide a Client ID as [required](https://aka.ms/MixerDevIdentification) by Mixer. To do this, follow these steps:

- Create an account on https://mixer.com
- Go to the [Dev Lab](https://mixer.com/lab/oauth)
- Accept the Developer Agreement
- Create an OAuth app
- Copy its Client ID
- Set the `STREMIO_MIXER_CLIENT_ID` environment variable to the copied value


## Installation

```
git clone https://github.com/ax-schneider/stremio-mixer
cd stremio-mixer
npm install
```


## Usage

Set any environment variables before running the app.

Command              | Action
---------------------| -----------------------
`npm start`          | Start the add-on
`docker-compose up`  | Run the add-on in Docker
`npm run build`      | Build the add-on
`npm test`           | Test the add-on


## Environment Variables

Boolean variables are defined as "true"/"false" strings.

Variable                | Default Value     | Description
------------------------| ------------------| ---------------
STREMIO_MIXER_CLIENT_ID |                   | Your Mixer app Client ID (required)
STREMIO_MIXER_ADDRESS   | http://localhost  | Public address this add-on is going to be accessible on
STREMIO_MIXER_PORT      | 80                | Port to listen to
STREMIO_MIXER_EMAIL     |                   | Contact email
STREMIO_MIXER_CACHE     | true              | Toggle caching
STREMIO_MIXER_ANNOUNCE  | false             | Toggle announcing the add-on to Stremio
STREMIO_MIXER_LOG       | 1                 | 0 to turn logging off, 1 to print errors, 2 to also print requests to Stremio methods, 3 to print all HTTP requests


## Known Issues

- Mixer API doesn't provide stream thumbnails in a reliable way. Because of that, some of the posters in the stream list might be blank.


## Screenshots

![Screenshot](/public/screenshot.jpg)


## License

[ISC](LICENSE)
