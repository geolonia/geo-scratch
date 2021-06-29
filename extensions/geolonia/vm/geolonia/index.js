const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const geolonia = require('@geolonia/embed');

const Message = {
}

const AvailableLocales = ['en', 'ja', 'ja-Hira'];

const style = {
    "version": 8,
    "sources": {
    "japan": {
    "type": "vector",
    "url": "https://cdn.geolonia.com/tiles/japanese-prefectures.json"
    }
    },
    "glyphs": "https://glyphs.geolonia.com/{fontstack}/{range}.pbf",
    "layers": [
        {
            "id": "background",
            "type": "background",
            "paint": {
                "background-color": "#222222"
            }
        },
        {
            "id": "prefs",
            "type": "fill",
            "source": "japan",
            "source-layer": "prefectures",
            "paint": {
                "fill-color": "#333333",
                "fill-outline-color": "#444444"
            }
        },
        {
            id: 'point-pref',
            type: 'circle',
            source: "japan",
            "source-layer": "admins",
            paint: {
                'circle-radius': 4,
                'circle-color': 'rgba(255, 255, 255, 0.6)',
            },
        }
    ],
}

class Scratch3GeoloniaBlocks {
    constructor (runtime) {
        this.runtime = runtime;

        let script = document.createElement('script');
        script.src = 'https://cdn.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY';
        document.body.appendChild(script);
    }

    getInfo () {
        this._locale = this.setLocale();

        return {
            id: 'geolonia2scratch',
            name: 'Geolonia2Scratch',
            blocks: [
                {
                    opcode: 'display',
                    blockType: BlockType.COMMAND,
                    text: '日本地図を表示',
                },
                {
                    opcode: 'flyTo',
                    blockType: BlockType.COMMAND,
                    text: "経度 [LNG] 緯度 [LAT] ズーム [ZOOM] に移動",
                    arguments: {
                      LNG: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 139.74
                      },
                      LAT: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 35.65
                      },
                      ZOOM: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 10
                      },
                    }
                },
            ],
            menus: {
            }
        };
    }

    display(args) {
        const mapContainer = document.getElementById('geolonia-map')

        if (mapContainer) {
            mapContainer.parentNode.removeChild(mapContainer)
        }

        div = document.createElement("div");
        div.id = 'geolonia-map';
        div.setAttribute("style", "width:100%;height:100%;position:absolute;top:0px;");
        let canvas = document.getElementsByTagName('canvas')[0];
        canvas.parentNode.insertBefore(div, canvas);

        this.map = {}
        this.map = new global.geolonia.Map({
            container: '#geolonia-map',
            style: 'geolonia/basic',
            center: [0, 0],
            zoom: 0,
        });
    }

    flyTo(args) {
      this.map.flyTo({center: [args.LNG, args.LAT], zoom: 10});
    }

    setLocale() {
      let locale = formatMessage.setup().locale;
      if (AvailableLocales.includes(locale)) {
        return locale;
      } else {
        return 'en';
      }
    }
}

module.exports = Scratch3GeoloniaBlocks;
