import { Point } from '/src/lib/point'
import { Color } from '/src/lib/color'
import { Direction } from '/src/lib/direction'
import { Random } from '/src/lib/random'
import { Rect } from '/src/lib/number'
import { Matrix } from '/src/lib/matrix'

import { Place } from './data'


export class PlaceChunk {
    #layers
    #matrix
    #chunkRect

    constructor({world, chunkSize, worldPoint}) {
        this.worldPoint = worldPoint
        this.size = chunkSize
        this.#layers = world.layers
        this.#chunkRect = Rect.multiply(world.rect, this.size)
        this.#matrix = this.#build(chunkSize, worldPoint)
    }

    #build(chunkSize, worldPoint) {

    }

    get(point) {
        const placeId = this.#matrix.get(point)
        return Place.get(placeId)
    }
}