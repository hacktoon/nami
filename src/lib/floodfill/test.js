import { SingleFillUnit } from './single'


class TestFloodFill extends SingleFillUnit {
    setValue(cell, level) {
        this.context.filled.add(cell)
    }

    isEmpty(cell) {
        return ! this.context.filled.has(cell)
    }

    getNeighbors(cell) {
        return this.context.graph[cell]
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
    const context = {
        graph,
        items,
        filled: new Set()
    }
    const fill = new TestFloodFill(1, context)
    let seeds = fill.grow()
    expect(context.filled.size).toBe(3)
    expect(seeds).toStrictEqual([2, 3])
    expect(Array.from(context.filled)).toStrictEqual([1, 2, 3])
    seeds = fill.grow()
    expect(context.filled.size).toBe(4)
    expect(seeds).toStrictEqual([4])
    expect(Array.from(context.filled)).toStrictEqual([1, 2, 3, 4])
})
