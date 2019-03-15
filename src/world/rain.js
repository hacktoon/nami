
class RainMap {
    static get (id=null) {
        const _map = [
            { id: 0, height: 0,   color: "red",       name: "Very dry" },
            { id: 1, height: 30,  color: "coral",     name: "Dry" },
            { id: 2, height: 90,  color: "lightblue", name: "Wet" },
            { id: 3, height: 210, color: "blue",      name: "Very wet" }
        ]
        if (_.isNumber(id)) {
            let index = _.clamp(id, 0, _map.length-1)
            return _map[index]
        }
        return _map
    }

    static getHighest () {
        return _.last(RainMap.get()).id
    }

    static getLowest () {
        return _.first(RainMap.get()).id
    }
}


class Rain {
    constructor (height) {
        const _map = RainMap.get()
        for(let i = 0; i < _map.length; i++) {
            let rainData = _map[i]
            if (height >= rainData.height) {
                this.rain = rainData
            } else {
                break
            }
        }
    }

    get id () { return this.rain.id }
    get name () { return this.rain.name }
    get height () { return this.rain.height }
    get color () { return this.rain.color }

    raise (amount=1) {
        this.rain = RainMap.get(this.id + amount)
    }

    lower (amount=1) {
        this.rain = RainMap.get(this.id - amount)
    }

    isLower (rain) {
        return this.id < rain.id
    }

    isHigher (rain) {
        return this.id > rain.id
    }

    isLowest () {
        return this.id === RainMap.getLowest()
    }

    isHighest () {
        return this.id === RainMap.getHighest()
    }
}
