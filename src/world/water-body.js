import _ from 'lodash'


const waterBodyTable = [
    { id: 0, type: "Lake", color: "#000056", scale: -3 }
]


export default class WaterBody {
    constructor() {
    }

    get id() { return this.waterBody.id }
    get height() { return this.waterBody.height }
    get color() { return this.waterBody.color }


}
