var NameGenerator = (function(){
    var firstNames = [
        "Gond",
        "Ad",
        "Bren",
        "Ard",
        "Meso",
        "Atla",
        "Ard",
        "Astra",
        "Dra",
        "Tre",
    ];

    var lastNames = [
        "wana",
        "inia",
        "lum",
        "meria",
        "moria",
        "ania",
        "andia",
        "icia",
    ];

    var createName = function(){
        return _.sample(firstNames) + _.sample(lastNames);
    };

    return {
        createName: createName
    }
})();