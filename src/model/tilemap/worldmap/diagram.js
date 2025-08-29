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
    Type.boolean('showZones', 'Zones', {default: true}),
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
        const showZones = this.params.get('showZones') && props.tileSize >= 30
        if (showZones) {
            const zone = this.tileMap.getZone(props.tilePoint)
            if (zone[layerName]) {
                zone[layerName].draw({...props, world, zone}, this.params)
            }
        } else {
            world[layerName].draw({...props, world}, this.params)
        }
    }
}
