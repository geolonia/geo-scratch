const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const { openReverseGeocoder } = require('@geolonia/open-reverse-geocoder');

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
        this.addr = {
            code: '',
            prefecture: '',
            city: ''
        }
    }

    getInfo () {
        this._locale = this.setLocale();

        return {
            id: 'geolonia',
            name: '地図',
            blocks: [
                {
                    opcode: 'displayMap',
                    blockType: BlockType.COMMAND,
                    text: '地図を経度 [LNG] 緯度 [LAT] ズーム [ZOOM] で表示',
                    arguments: {
                        LNG: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        LAT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0,
                        },
                        ZOOM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10,
                        },
                    }
                },
                {
                    opcode: 'flyTo',
                    blockType: BlockType.COMMAND,
                    text: "経度 [LNG] 緯度 [LAT] ズーム [ZOOM] にジャンプ",
                    arguments: {
                      LNG: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 139.74,
                      },
                      LAT: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 35.65,
                      },
                      ZOOM: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 10,
                      },
                    }
                },
                {
                    opcode: 'bearingTo',
                    blockType: BlockType.COMMAND,
                    text: "地図を [DEGREE] 度回転する",
                    arguments: {
                        DEGREE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 25,
                        },
                    }
                },
                {
                    opcode: 'moveVertical',
                    blockType: BlockType.COMMAND,
                    text: "地図を縦に [DISTANCE] ピクセル移動する",
                    arguments: {
                        DISTANCE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                    }
                },
                {
                    opcode: 'moveHorizontal',
                    blockType: BlockType.COMMAND,
                    text: "地図を横に [DISTANCE] ピクセル移動する",
                    arguments: {
                        DISTANCE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 100,
                        },
                    }
                },
                {
                    opcode: 'getPref',
                    blockType: BlockType.REPORTER,
                    text: "都道府県名",
                },
                {
                    opcode: 'getCity',
                    blockType: BlockType.REPORTER,
                    text: "市区町村名",
                },
            ],
            menus: {
            }
        };
    }

    getPref() {
        return this.addr.prefecture
    }

    getCity() {
        return this.addr.city
    }

    displayMap(args) {
        return new Promise((resolve) => {
            const mapContainer = document.getElementById('geolonia')

            if (document.getElementById('map')) {
                mapContainer.removeChild(document.getElementById('map'))
            }

            div = document.createElement("div");
            div.id = 'map';
            div.setAttribute("style", "width:100%;height:100%;");
            div.dataset.navigationControl = 'off';

            mapContainer.appendChild(div);

            this.map = {}
            this.map = new geolonia.Map({
                container: '#map',
                style: 'geolonia/midnight',
                center: [args.LNG, args.LAT],
                zoom: args.ZOOM,
                pitch: 0,
            });

            this.map.once('load', () => {
                this.map.on('moveend', () => {
                    openReverseGeocoder(Object.values(this.map.getCenter())).then(res => {
                        this.addr = res
                    })
                })

                const resizeObserver = new ResizeObserver(entries => {
                    console.log('aaaaaaaaaaaaa')
                    this.map.resize()
                });

                resizeObserver.observe(mapContainer);

                resolve()
            })
        })
    }

    bearingTo(args) {
        return new Promise((resolve) => {
            this.map.easeTo({
                bearing: this.map.getBearing() - args.DEGREE,
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve()
            })
        })
    }

    moveVertical(args) {
        const promise = new Promise((resolve) => {
            this.map.panBy([0, args.DISTANCE], {
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve()
            })
        })

        return promise
    }

    moveHorizontal(args) {
        const promise = new Promise((resolve) => {
            this.map.panBy([args.DISTANCE, 0], {
                easing: this.easing
            });

            this.map.once('moveend', () => {
                resolve()
            })
        })

        return promise
    }

    flyTo(args) {
        const promise = new Promise((resolve) => {
            this.map.flyTo({center: [args.LNG, args.LAT], zoom: args.ZOOM});

            this.map.once('moveend', () => {
                resolve()
            })
        })

        return promise
    }

    easing(t) {
        return t * (2 - t);
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
