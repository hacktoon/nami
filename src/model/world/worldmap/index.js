import { Name } from '/lib/name'
import { Schema, Type } from '/lib/schema'
import { BaseMap } from '/model/lib/map'

import { ReliefMap } from './geo/relief'
import { MapDiagram } from './diagram'


export default class WorldMap extends BaseMap {
    static schema = new Schema(
        Type.number('roughness', 'Roughness', 8, {min: 1, step: 1}),
        Type.number('size', 'Size', 257, {min: 1, step: 1}),
        Type.text('seed', 'Seed', '')
    )

    static diagram = MapDiagram

    static create(params) {
        return new WorldMap(params)
    }

    constructor(params) {
        super(params)
        this.size = params.get('size')
        this.width = params.get('size')
        this.height = params.get('size')
        this.roughness = params.get('roughness')
        this.area = this.size * this.size
        this.name = Name.createLandmassName()
        this.reliefMap = new ReliefMap(this.size, this.roughness)
    }
}