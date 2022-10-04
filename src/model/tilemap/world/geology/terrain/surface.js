import { PairMap } from '/src/lib/map'
import { ScanlineFill8 } from '/src/lib/floodfill/scanline'
import { Terrain } from './schema'


const MINIMUN_OCEAN_RATIO = 1  // 1%


export class LandmassMap {
    constructor({waterPointMap, bodies, oceans}) {
        this.waterPointMap = waterPointMap
        this.bodies = bodies
        this.oceans = oceans
    }

    isOcean(point) {
        if (this.waterPointMap.has(...point)) {
            const id = this.waterPointMap.get(...point)
            return this.oceans.has(id)
        }
        return false
    }
}
