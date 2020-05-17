//import { WaterFlowMap } from './flow'
import { WaterbodyMap } from './body'


export class WaterMap {
    constructor(size, reliefMap) {
        this.size = size
        //this.waterFlowMap = new WaterFlowMap(size, reliefMap)
        this.waterbodyMap = new WaterbodyMap(size, reliefMap)
    }

    get(point) {
        return this.waterbodyMap.get(point)
    }

    getName(point) {
        return this.waterbodyMap.getName(point)
    }

    getColor(point) {
        return this.waterbodyMap.getColor(point)
    }
}
