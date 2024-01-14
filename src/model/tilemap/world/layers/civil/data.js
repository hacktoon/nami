export class City {
    static parse(id) {
        return TYPE_MAP[id]
    }
}


export class Capital extends City {
    static id = 0
    static name = 'Capital'
    static populationRange = [2001, 5000]
}


export class Town extends City {
    static id = 1
    static name = 'Town'
    static populationRange = [201, 2000]
}


export class Village extends City {
    static id = 2
    static name = 'Village'
    static populationRange = [20, 200]
}


const TYPE_MAP = {
    0: Capital,
    1: Town,
    2: Village,
}