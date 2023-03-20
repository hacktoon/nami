import { PointMap } from '/src/lib/point/map'
import { Random } from '/src/lib/random'

import { HYDRO_NAMES } from '../names'
import { Temperature } from '../../climatology/temperature/data'
import { Rain } from '../../climatology/rain/data'
import { Biome } from '../../biology/biome/data'

import { Lake } from './data'


const LAKE_CHANCE = .5
const OASIS_CHANCE = .1


export class LakeLayer {
    // maps an id to a name
    #names = new Map()
    // map a point to an id
    #lakes = new PointMap()
    #typeMap = new Map()

    constructor(layers) {
        let lakeId = 0
        for (let point of layers.basin.getDepressions()) {
            const type = this.#detectType(layers, point)
            if (type) {
                this.#names.set(lakeId, Random.choiceFrom(HYDRO_NAMES))
                this.#lakes.set(point, lakeId)
                this.#typeMap.set(lakeId, type.id)
                lakeId++
            }
        }
    }

    #detectType(layers, point) {
        const rain = layers.rain.get(point)
        const temperature = layers.temperature.get(point)
        const biome = layers.biome.get(point)
        if (biome.is(Biome.DESERT)) {
            if (Random.chance(OASIS_CHANCE)) return Lake.OASIS
            return null
        }
        if (Random.chance(LAKE_CHANCE)) {
            if (layers.river.has(point)) {
                if (layers.river.isMouth(point)) { // is river big?
                    return Lake.ESTUARY
                }
            }
            return Lake.FRESH
        }
        return null
    }

    get count() {
        return this.#names.size
    }

    has(point) {
        return this.#lakes.has(point)
    }

    get(point) {
        const id = this.#lakes.get(point)
        return {
            id,
            name: this.#names.get(id),
            type: Lake.fromId(this.#typeMap.get(id)),
        }
    }

    getText(point) {
        if (! this.has(point))
            return ''
        const lake = this.get(point)
        const attrs = [
             `name=${lake.name}`,
             `type=${lake.type.name}`,
        ].join(',')
        return `Lake(${attrs})`
    }
}
