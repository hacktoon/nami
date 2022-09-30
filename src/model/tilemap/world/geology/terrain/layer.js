import { NOISE_SPEC } from './noise'


class Layer {
    constructor(props) {
        this.props = props
    }
}


class LandOutlineLayer extends Layer {
    apply(noise) {

    }
}


export const LAYERS = [
    {
        noise: NOISE_SPEC.feature,
        ratio: .33
    }
]
