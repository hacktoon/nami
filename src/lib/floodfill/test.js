import { SingleFillUnit } from './single'


class TestFloodFill extends SingleFillUnit {
    setValue(cell, level) {
        this.model.filled.add(cell)
    }

    isEmpty(cell) {
        return ! this.model.filled.has(cell)
    }

    getNeighbors(cell) {
        return this.model.graph[cell]
    }
}


test('simple flood fill', () => {
    const items = [1, 2, 3, 4]
    const graph = {
        1: [2, 3],
        2: [1, 4],
        3: [1],
        4: [2, 5],
        5: [4],
    }
    const model = {
        graph,
        items,
        filled: new Set()
    }
    const fill = new TestFloodFill(1, model)
    let seeds = fill.grow()
    expect(model.filled.size).toBe(3)
    expect(seeds).toStrictEqual([2, 3])
    expect(Array.from(model.filled)).toStrictEqual([1, 2, 3])
    seeds = fill.grow()
    expect(model.filled.size).toBe(4)
    expect(seeds).toStrictEqual([4])
    expect(Array.from(model.filled)).toStrictEqual([1, 2, 3, 4])
})
