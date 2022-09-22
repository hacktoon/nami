
class Layer {
    constructor(props) {
        this.props = props
    }
}


class LandOutlineLayer extends Layer {
    apply(noise) {

    }
}


export const PIPELINE = [
    LandOutlineLayer({
        noise: NOISE_SPEC.outline,
        terrain: Terrain.BASIN,
        baseTerrain: Terrain.SEA,
        ratio: .55
    }),
    [
        {
            noise: NOISE_SPEC.feature,
            terrain: Terrain.PLAIN,
            baseTerrain: Terrain.BASIN,
            ratio: .33
        },
        {
            noise: NOISE_SPEC.outline,
            terrain: Terrain.OCEAN,
            baseTerrain: Terrain.SEA,
            ratio: .47
        }
    ],
    [
        {
            noise: NOISE_SPEC.grained,
            terrain: Terrain.PLATEAU,
            baseTerrain: Terrain.PLAIN,
            ratio: .42
        },
        {
            noise: NOISE_SPEC.grained,
            terrain: Terrain.ABYSS,
            baseTerrain: Terrain.OCEAN,
            ratio: .4
        }
    ],
    [
        {
            noise: NOISE_SPEC.feature,
            terrain: Terrain.MOUNTAIN,
            baseTerrain: Terrain.PLATEAU,
            ratio: .45
        },
        {
            noise: NOISE_SPEC.feature,
            terrain: Terrain.SEA,
            baseTerrain: Terrain.OCEAN,
            ratio: .3
        }
    ],
    [
        {// put peaks on mountains
            noise: NOISE_SPEC.grained,
            terrain: Terrain.PEAK,
            baseTerrain: Terrain.MOUNTAIN,
            ratio: .65
        },
        {// put islands on sea
            noise: NOISE_SPEC.grained,
            terrain: Terrain.BASIN,
            baseTerrain: Terrain.SEA,
            ratio: .6
        },
    ],
]
