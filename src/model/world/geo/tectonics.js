import { Grid } from '/lib/grid'
import { TileableHeightMap } from '/lib/heightmap'


export class TectonicsMap {
    constructor() {
    }
}


class Tectonics {
    constructor() {
        self.plates = []
    }
}


class Plate {
    constructor(name='anonym', dir=1) {
        self.name = name
        self.dir = dir
    }
}