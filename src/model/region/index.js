
export default class Region {
    constructor() {
        this.points = []
    }

    iter(callback) {
        this.points.forEach(callback)
    }

    get(point) {
        return this.points.get(point)
    }
}