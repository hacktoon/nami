export class City {
    static parse(id) {
        return TYPE_MAP[id]
    }
}


export class Capital extends City {
    static id = 0
    static name = 'Capital'
}


export class Town extends City {
    static id = 1
    static name = 'Town'
}


export class Village extends City {
    static id = 2
    static name = 'Village'
}


const TYPE_MAP = {
    0: Capital,
    1: Town,
    2: Village,
}