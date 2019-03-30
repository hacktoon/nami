import _ from 'lodash'
import { Random } from './base';

const personNames = {
    first: [
        "Joe", "Mary", "Zoe", "La", "Bo", "Jack", "Zedd", "Will", "Bill", "Hassam", "Jen", "Eva", "Adam", "Moe", "Liz", "Walter", "John", "Mick", "Ana", "Luci", "Ceci", "Fran", "Carol", "James", "Eric", "Cesar", "Rudi", "May", "Laila", "Vic", "Albert", "Steve", "Jane", "Sara","Vivi", "Liane", "Ada", "Cindy", "Amora", "Bea", "Isobel", "Iane", "Hector", "Mandy", "Amanda", "Bob", "Liv", "Licia", "Obi", "Dave", "Pat", "Ani", "Bel"
    ],

    last: [
        "Brum", "Vick", "Liz", "Laverne", "Melifleur", "Baroq", "Almon", "Hadd", "Orlon", "Labelle", "Flops", "Baron", "Zuid", "Well", "Katman", "Arman", "Odd", "Virgo", "Atuk"
    ]
}

const landMassNames = {
    first: [
        "Bre", "Ad", "Bren", "Ard", "Meso", "Atla", "Ard", "Astra", "Dra", "Tre", "Ar", "Eud", "Aud"
    ],

    last: [
        "wana", "inia", "lum", "meria", "moria", "ania", "andia", "icia", "vedia"
    ]
}

const oceanNames = [
    "Ashu", "Indran", "Atlass", "Amon", "Aru", "Andia", "Barion", "Ebo", "Mu", "Valis", "Omer"
]

const seaNames = [
    "Hexamaris", "Blumarum"
]

const riverNames = [
    "Mandrian", "Inu", "Assad", "Io", "Asten", "Miran", "Basum"
]


export class Name {
    static createLandMassName () {
        return Random.choice(landMassNames.first) + Random.choice(landMassNames.last)
    }

    static createPersonName () {
        return Random.choice(personNames.first) +" "+ Random.choice(personNames.last)
    }

    static createWaterbodyName() {
        return Random.choice(oceanNames)
    }

    static createRiverName() {
        return Random.choice(riverNames)
    }
}
