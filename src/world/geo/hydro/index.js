import { RiverMap } from './river'


export class HydroMap {
    constructor(size, reliefMap, moistureMap) {


    }

    _buildWaterbodies() {
        this.grid.forEach((_, point) => this._detect(point))
    }

    _buildRivers() {
        //new RiverMap(this.reliefMap, this)
    }

}
