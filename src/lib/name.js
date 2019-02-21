var NameGenerator = (function(){

    var person = {
        first: [
            "Joe", "Mary", "Zoe", "La", "Bo", "Jack", "Zedd", "Will", "Bill", "Hassam", "Jen", "Eva", "Adam", "Moe", "Liz", "Walter", "John", "Mick", "Ana", "Luci", "Ceci", "Fran", "Carol", "James", "Eric", "Cesar", "Rudi", "May", "Laila", "Vic", "Albert", "Steve", "Jane", "Sara","Vivi", "Liane", "Ada", "Cindy", "Amora", "Bea", "Isobel", "Iane", "Hector", "Mandy", "Amanda", "Bob", "Liv", "Licia", "Obi", "Dave", "Pat", "Ani", "Bel"
        ],

        last: [
            "Brum", "Vick", "Liz", "Laverne", "Melifleur", "Baroq", "Almon", "Hadd", "Orlon", "Labelle", "Flops", "Baron", "Zuid", "Well", "Katman", "Arman", "Odd", "Virgo", "Atuk"
        ]
    };

    var landMass = {
        first: [
            "Bre", "Ad", "Bren", "Ard", "Meso", "Atla", "Ard", "Astra", "Dra", "Tre", "Ar", "Eud", "Aud"
        ],

        last: [
            "wana", "inia", "lum", "meria", "moria", "ania", "andia", "icia", "vedia"
        ]
    };

    var createLandMassName = function(){
        return _.sample(landMass.first) + _.sample(landMass.last);
    };

    var createPersonName = function(){
        return _.sample(person.first) +" "+ _.sample(person.last);
    };

    return {
        createLandMassName: createLandMassName,
        createPersonName: createPersonName
    }
})();