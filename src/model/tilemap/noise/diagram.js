import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { Color } from '/src/lib/color'
import { TileMapDiagram } from '/src/lib/model/tilemap'


class NoiseColorMap {
    #normalize(value, maxColors) {
        const [min, max] = this.tileMap.range
        // normalize to [0, 1]
        const percent = (value - min) / (max - min)
        return Math.floor(percent * 256 / maxColors)
    }

    constructor(tileMap) {
        this.tileMap = tileMap
        console.log(this.tileMap.range);
    }

    get(point, maxColors) {
        const rawValue = Number(this.tileMap.getNoise(point))
        const value = this.#normalize(rawValue, maxColors)
        if (point[0] == 142 && point[1]== 55) {
            console.log(rawValue, value);
        }
        return new Color(value, value, value).invert()
    }
}


export class NoiseTileMapDiagram extends TileMapDiagram {
    static schema = new Schema(
        'NoiseTileMapDiagram',
        Type.number('maxColors', 'Max colors', {
            default: 200, step: 1, min: 1, max: 256
        }),
    )
    static colorMap = NoiseColorMap

    static create(tileMap, colorMap, params) {
        return new NoiseTileMapDiagram(tileMap, colorMap, params)
    }

    constructor(tileMap, colorMap, params) {
        super(tileMap)
        this.colorMap = colorMap
        this.maxColors = params.get('maxColors')
    }

    get(point) {
        return this.colorMap.get(point, this.maxColors)
    }
}
