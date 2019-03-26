import { Name } from '../../lib/name'
import { getChance } from '../../lib/base';


const RIVER_CHANCE = 0.05


export class RiverBuilder {
    constructor(world) {
        this.world = world
        this.riverCounter = 1
    }

    detectRiverSource(point, neighbors) {
        let canHaveRivers = tile.elevation.canHaveRivers
        let isValley = this._isValley(neighbors)

        if (canHaveRivers && isValley && getChance(RIVER_CHANCE)) {
            return this._buildRiver(point)
        }
    }

    _isValley(neighbors) {
        let neighborMountains = 0
        neighbors.adjacent(point => {
            let tile = this.world.getTile(point)
            if (tile.elevation.isHighest) {
                neighborMountains++
            }
        })
        return neighborMountains == 2
    }

    _buildRiver(point) {
        let id = this.riverCounter++
        let name = Name.createWaterBodyName()
        return new River(id, name, [point])
    }
}


class River {
    constructor(id, name, points) {
        this.id = id
        this.name = name
        this.points = points
    }
}
