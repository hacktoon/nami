
const SPEC = [
    {name: 'Hydrotermal vent'},
    {name: 'Submarive volcano'},
    {name: 'Atol'},
    {name: 'Sandbar'},
    {name: 'Volcano'},
    {name: 'Dunes'},
    {name: 'Beach'},
    {name: 'Waterfall'},
    {name: 'Rapid'},
    {name: 'Valley'},
    {name: 'Canyon'},
    {name: 'Cliffs'},
    {name: 'Inselberg'},
    {name: 'Table'},

]

const TYPE_MAP = new Map(SPEC.map(spec => [spec.id, spec]))

export class Landform {
    static fromId(id) {
        return TYPE_MAP.get(id) ?? SPEC[0]
    }
}


SPEC.forEach(spec => {
    const name = spec.name.toUpperCase().replace(/\s+/, '_')
    Landform[name] = spec
})
