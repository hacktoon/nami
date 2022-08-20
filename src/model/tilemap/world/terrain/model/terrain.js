class Terrain {
    constructor() {
        this.id = 7
        this.name = 'Peak'
        this.noise = RELIEF_NOISE_TYPE
        this.baseRatio = .6
        this.ratio = .8
        this.water = false
        this.color = Color.fromHex('#DDD')
    }
}