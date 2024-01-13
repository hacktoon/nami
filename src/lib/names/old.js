import { Random } from '/src/lib/random'


const PERSONS = {
    first: [
        'Joe', 'Mary', 'Zoe', 'La', 'Bo', 'Jack', 'Zedd', 'Will', 'Bill', 'Hassam', 'Jen', 'Eva', 'Adam', 'Moe', 'Liz', 'Walter', 'John', 'Mick', 'Ana', 'Luci', 'Ceci', 'Fran', 'Carol', 'James', 'Eric', 'Cesar', 'Rudi', 'May', 'Laila', 'Vic', 'Albert', 'Steve', 'Jane', 'Sara','Vivi', 'Liane', 'Ada', 'Cindy', 'Amora', 'Bea', 'Isobel', 'Iane', 'Hector', 'Mandy', 'Amanda', 'Bob', 'Liv', 'Licia', 'Obi', 'Dave', 'Pat', 'Ani', 'Bel'
    ],

    last: [
        'Brum', 'Vick', 'Liz', 'Laverne', 'Melifleur', 'Baroq', 'Almon', 'Hadd', 'Orlon', 'Labelle', 'Flops', 'Baron', 'Zuid', 'Well', 'Katman', 'Arman', 'Odd', 'Virgo', 'Atuk'
    ]
}

const LANDFORMS = {
    first: [
        'Bre', 'Ad', 'Bren', 'Ard', 'Meso', 'Atla', 'Ar', 'Astr', 'Dra', 'Tre', 'In', 'Eud', 'Aud', 'Au', 'Zor', 'Is', 'Er', 'Eu', 'Ur', 'Ir', 'Cor', 'Gon', 'San',
        'Zed', 'Arg', 'Ho', 'Re', 'Lam', 'Wan', 'Her'
    ],

    last: [
        'wana', 'inia', 'lum', 'meria', 'moria', 'ania', 'andia', 'icia', 'vedia', 'alia', 'ben', 'al', 'eb', 'ad', 'dor', 'dom', 'eon', 'ano', 'aria'
    ]
}

const OCEANS = [
    'Ashu', 'Indran', 'Atlass', 'Amon', 'Aru', 'Andia', 'Barion', 'Ebo', 'Mu', 'Valis', 'Omer', 'Vau', 'Thea', 'Geon', 'Bhor', 'Sett', 'Orlan', 'Bhan', 'Ebb', 'Numer', 'Trachian', 'Vishnu', 'Adom', 'Isidor', 'Astor', 'Atenor', 'Hexamar', 'Blum', 'Red', 'Blue', 'Green', 'Black', 'Purple', 'White', 'Salt'
]

const RIVERS = [
    'Mandrian', 'Inu', 'Assad', 'Io', 'Asten', 'Miran', 'Basum', 'Vau', 'Indo', 'Merin', 'Sepid', 'Urlan', 'Axum', 'Zend', 'Icari', 'Ben', 'Otetis', 'Odd'
]


export class Name {
    static createLandmassName () {
        return Random.choice(...LANDFORMS.first) + Random.choice(...LANDFORMS.last)
    }

    static createPersonName () {
        return Random.choice(...PERSONS.first) +' '+ Random.choice(...PERSONS.last)
    }

    static createWaterName() {
        return Random.choice(...OCEANS)
    }

    static createRiverName() {
        return Random.choice(...RIVERS)
    }
}
