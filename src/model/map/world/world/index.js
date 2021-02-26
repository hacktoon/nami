import { Name } from '/lib/name'
import { Schema } from '/lib/base/schema'
import { Type } from '/lib/base/type'
import { BaseMap } from '/model/lib/map'
import { MapUI } from '/lib/ui/map'

import { ReliefMap } from './relief'
import { MapDiagram } from './diagram'


const SCHEMA = new Schema(
    Type.number('roughness', 'Roughness', {default: 8, min: 1, step: 1}),
    Type.number('size', 'Size', {default: 257, min: 1, step: 1}),
    Type.text('seed', 'Seed', {default: ''})
)

export default class WorldMap extends BaseMap {
    static id = 'WorldMap'
    static diagram = MapDiagram
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