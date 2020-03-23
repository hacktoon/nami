import { Random } from './base';

const personNames = {
    first: [
        'Joe', 'Mary', 'Zoe', 'La', 'Bo', 'Jack', 'Zedd', 'Will', 'Bill', 'Hassam', 'Jen', 'Eva', 'Adam', 'Moe', 'Liz', 'Walter', 'John', 'Mick', 'Ana', 'Luci', 'Ceci', 'Fran', 'Carol', 'James', 'Eric', 'Cesar', 'Rudi', 'May', 'Laila', 'Vic', 'Albert', 'Steve', 'Jane', 'Sara','Vivi', 'Liane', 'Ada', 'Cindy', 'Amora', 'Bea', 'Isobel', 'Iane', 'Hector', 'Mandy', 'Amanda', 'Bob', 'Liv', 'Licia', 'Obi', 'Dave', 'Pat', 'Ani', 'Bel'
    ],

    last: [
        'Brum', 'Vick', 'Liz', 'Laverne', 'Melifleur', 'Baroq', 'Almon', 'Hadd', 'Orlon', 'Labelle', 'Flops', 'Baron', 'Zuid', 'Well', 'Katman', 'Arman', 'Odd', 'Virgo', 'Atuk'
    ]
}

const landformNames = {
    first: [
        'Bre', 'Ad', 'Bren', 'Ard', 'Meso', 'Atla', 'Ar', 'Astr', 'Dra', 'Tre', 'In', 'Eud', 'Aud', 'Au', 'Zor', 'Is', 'Er', 'Eu', 'Ur', 'Ir', 'Cor', 'Gon', 'San',
        'Zed', 'Arg', 'Ho', 'Re', 'Lam'
    ],

    last: [
        'wana', 'inia', 'lum', 'meria', 'moria', 'ania', 'andia', 'icia', 'vedia', 'elia', 'ben', 'al', 'eb', 'ad', 'dor'
    ]
}

const oceanNames = [
    'Ashu', 'Indran', 'Atlass', 'Amon', 'Aru', 'Andia', 'Barion', 'Ebo', 'Mu', 'Valis', 'Omer', 'Vau', 'Thea', 'Geon', 'Bhor', 'Sett', 'Orlan', 'Bhan', 'Ebb', 'Numer', 'Trachian', 'Vishnu', 'Adom', 'Isidor', 'Astor', 'Atenor', 'Hexamar', 'Blum', 'Red', 'Blue', 'Green', 'Black', 'Purple', 'White', 'Salt'
]

const riverNames = [
    'Mandrian', 'Inu', 'Assad', 'Io', 'Asten', 'Miran', 'Basum', 'Vau', 'Indo', 'Merin', 'Sepid', 'Urlan', 'Axum', 'Zend', 'Icari', 'Ben', 'Otetis', 'Odd'
]


export class Name {
    static createLandmassName () {
        return Random.choice(landformNames.first) + Random.choice(landformNames.last)
    }

    static createPersonName () {
        return Random.choice(personNames.first) +' '+ Random.choice(personNames.last)
    }

    static createWaterName() {
        return Random.choice(oceanNames)
    }

    static createRiverName() {
        return Random.choice(riverNames)
    }
}
