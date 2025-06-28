import { Schema } from '/src/lib/schema'
import { Type } from '/src/lib/type'
import { UIAudioSynth } from '/src/ui/synth'


const SCHEMA = new Schema(
    'Audio',
    Type.text('seed', 'Seed', {default: ''})
)


export class AudioSynth {
    static schema = SCHEMA
    static ui = UIAudioSynth

    static create(params) {
        return new AudioSynth(params)
    }

    static fromData(data) {
        const map = new Map(Object.entries(data))
        const params = NoiseTileMap.schema.buildFrom(map)
        return new NoiseTileMap(params)
    }

    constructor(params) {
        this.params = params
    }

}
