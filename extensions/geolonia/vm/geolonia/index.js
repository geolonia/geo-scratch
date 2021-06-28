const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const formatMessage = require('format-message');
const geolonia = require('@geolonia/embed');

const Message = {
}
const AvailableLocales = ['en', 'ja', 'ja-Hira'];

class Scratch3Geolonia2ScratchBlocks {
    constructor (runtime) {
        this.runtime = runtime;

        let script = document.createElement('script');
        script.src = 'https://cdn.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY';
        document.body.appendChild(script);

        div = document.createElement("div");
        div.id = 'map';
        div.className = 'geolonia';
        div.dataset.style = 'geolonia/homework';

        div.setAttribute("style", "width:100%;height:100%;opacity:0.5;position:absolute;top:0px;");
        let canvas = document.getElementsByTagName('canvas')[0];
        canvas.parentNode.appendChild(div);

        this.map = new global.geolonia.Map('#map');
    }

    getInfo () {
        this._locale = this.setLocale();

        return {
            id: 'geolonia2scratch',
            name: 'Geolonia2Scratch',
            blocks: [
                {
                    opcode: 'panBy',
                    blockType: BlockType.COMMAND,
                    text: 'x方向に [X] y方向に [Y] 移動する',
                    arguments: {
                      X: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 100
                      },
                      Y: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 0
                      }
                    }
                },
                {
                    opcode: 'panTo',
                    blockType: BlockType.COMMAND,
                    text: "経度 [LNG] 緯度 [LAT] に移動",
                    arguments: {
                      LNG: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 139.74
                      },
                      LAT: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 35.65
                      }
                    }
                },
                {
                    opcode: 'setZoom',
                    blockType: BlockType.COMMAND,
                    text: "ズームレベル [ZOOM] にする",
                    arguments: {
                      ZOOM: {
                        type: ArgumentType.NUMBER,
                        defaultValue: 10
                      }
                    }
                },
            ],
            menus: {
            }
        };
    }

    panBy(args) {
      this.map.panBy([args.X, -args.Y]);
    }

    panTo(args) {
      this.map.panTo([args.LNG, args.LAT]);
    }

    setZoom(args) {
      this.map.setZoom(args.ZOOM);
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

module.exports = Scratch3Geolonia2ScratchBlocks;
