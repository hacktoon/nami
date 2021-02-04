export class BaseFloodFill {
    constructor(origin, params) {
        this.origin = origin
        this.seeds = [origin]
        this.setValue = params.setValue
        this.isEmpty = params.isEmpty

        this.growSeeds()
    }

    grow() {
        this.spreadSeeds()
        this.growSeeds()
        return this.seeds
    }

    spreadSeeds() {
        let seeds = []
        this.seeds.forEach(point => {
            point.adjacents().forEach(seedCandidate => {
                if (! this.isEmpty(seedCandidate)) return
                seeds.push(seedCandidate)
            })
        })
        this.seeds = seeds
    }

    growSeeds() {
        this.seeds.forEach(point => this.setValue(point))
    }
}