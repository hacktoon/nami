import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'

import { TileMapDiagram } from '/src/model/tilemap/lib'


const DEFAULT_LAYER = 'biome'
const LAYERS = [
    {value: 'surface', label: 'Surface'},
    {value: 'climate', label: 'Climate'},
    {value: 'rain', label: 'Rain'},
    {value: 'basin', label: 'Basin'},
    {value: 'biome', label: 'Biome'},
    {value: 'river', label: 'River'},
    {value: 'civil', label: 'Civil'},
    // {value: 'relief', label: 'Relief'},
]

const SCHEMA = new Schema(
    'WorldTileMapDiagram',
    Type.selection('showLayer', 'Layer', {default: DEFAULT_LAYER, options: LAYERS}),
    Type.boolean('showErosion', 'Erosion', {default: false}),
    Type.boolean('showChunks', 'Chunks', {default: true}),
    Type.boolean('showRivers', 'Rivers', {default: true}),
    Type.boolean('showCities', 'Cities', {default: false}),
    Type.boolean('showCityArea', 'CityArea', {default: false}),
    Type.boolean('showRoutes', 'Routes', {default: false}),
)

export class WorldTileMapDiagram extends TileMapDiagram {
    static schema = SCHEMA

    static create(tileMap, params) {
        return new WorldTileMapDiagram(tileMap, params)
    }

    constructor(tileMap, params) {
        super(tileMap)
        this.params = params
    }

    draw(props) {
        const world = this.tileMap.world
        const layerName = this.params.get('showLayer')
        const showChunks = this.params.get('showChunks') && props.tileSize >= 30
        if (showChunks) {
            const chunk = this.tileMap.getChunk(props.tilePoint)
            if (chunk[layerName]) {
                chunk[layerName].draw({...props, world, chunk}, this.params)
            }
        } else {
            world[layerName].draw({...props, world}, this.params)
        }
    }
}
