import { Name } from '/lib/name'
import { Schema, Type } from '/lib/schema'
import { BaseMap } from '/model/lib/map'
import { MapUI } from '/ui/map'

import { ReliefMap } from './geo/relief'
import { MapDiagram } from './diagram'


const SCHEMA = new Schema(
    Type.number('roughness', 'Roughness', 8, {min: 1, step: 1}),
    Type.number('size', 'Size', 257, {min: 1, step: 1}),
    Type.text('seed', 'Seed', '')
)

export default class WorldMap extends BaseMap {
    static diagram = MapDiagram
    static label = 'World map'
    static schema = SCHEMA
    static ui = MapUI

    static create(params) {
        return new WorldMap(params)
    }

    constructor(params) {
        super(params)
        this.size = params.get('size')
        this.width = params.get('size')
        this.height = params.get('size')
        this.roughness = params.get('roughness')
        this.name = Name.createLandmassName()
        this.reliefMap = new ReliefMap(this.size, this.roughness)
    }
}