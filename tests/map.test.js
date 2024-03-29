import { expect, test } from 'vitest'
import { IndexMap, PairMap } from '/src/lib/map'


//////////////////////////////////////////////////////
// IndexMap
//////////////////////////////////////////////////////
test("indexMap initialization", () => {
    const indexMap = new IndexMap(['a', 'b', 'c'])
    expect(indexMap.getIndex('a')).toBe(0)
    expect(indexMap.getIndex('b')).toBe(1)
    expect(indexMap.getIndex('c')).toBe(2)
})


test("indexMap delete item", () => {
    const indexMap = new IndexMap(['a', 'b', 'c'])
    expect(indexMap.has('b')).toBe(true)
    indexMap.delete('b')
    expect(indexMap.has('a')).toBe(true)
    expect(indexMap.has('c')).toBe(true)
    expect(indexMap.has('b')).toBe(false)
})


test("indexMap item size after delete", () => {
    const indexMap = new IndexMap(['a', 'b', 'c'])
    expect(indexMap.size).toBe(3)
    indexMap.delete('b')
    expect(indexMap.size).toBe(2)
})


test("indexMap index changes after delete", () => {
    const indexMap = new IndexMap(['a', 'b', 'c'])
    expect(indexMap.getIndex('c')).toBe(2)
    indexMap.delete('b')
    expect(indexMap.getIndex('c')).toBe(1)
})


test("indexMap add item", () => {
    const indexMap = new IndexMap(['a', 'b'])
    indexMap.add('c')
    expect(indexMap.getIndex('c')).toBe(2)
    expect(indexMap.size).toBe(3)
})


test("indexMap add item and delete another", () => {
    const indexMap = new IndexMap(['a', 'b'])
    indexMap.add('c')
    indexMap.delete('b')
    expect(indexMap.getIndex('c')).toBe(1)
    expect(indexMap.size).toBe(2)
})


test("IndexMap forEach", () => {
    const values = ['a', 'b', 'c']
    const indexMap = new IndexMap(values)
    let index = 0
    indexMap.forEach(item => {
        expect(item).toBe(values[index])
        index++
    })
    expect(index).toBe(values.length)
})


//////////////////////////////////////////////////////
// PairMap
//////////////////////////////////////////////////////

const POINT_MAP = [
    [0, 0], [0, 1], [0, 2]
]


test("Empty PairMap has size zero", () => {
    const pairMap = new PairMap()
    expect(pairMap.size).toBe(0)
})


test("PairMap can set values", () => {
    const pairMap = new PairMap()
    pairMap.set(0, 0, 'first')
    pairMap.set(1, 1, 'second')
    pairMap.set(2, 2, 'third')
    expect(pairMap.size).toBe(3)
    expect(pairMap.get(0, 0)).toBe('first')
    expect(pairMap.get(1, 1)).toBe('second')
    expect(pairMap.get(2, 2)).toBe('third')
})

test("PairMap can delete values", () => {
    const pairMap = new PairMap()
    pairMap.set(0, 0, 'first')
    pairMap.delete(0, 0)
    expect(pairMap.get(0, 0)).toBe(undefined)
})


test("PairMap forEach", () => {
    const pairMap = new PairMap()
    pairMap.set(0, 0, 'first')
    pairMap.set(1, 1, 'second')
    pairMap.set(2, 2, 'third')
    const points = []
    const values = []
    pairMap.forEach((point, value) => {
        points.push(point)
        values.push(value)
    })
    expect(points).toStrictEqual([
        [0, 0],
        [1, 1],
        [2, 2],
    ])
    expect(values).toStrictEqual([
        'first',
        'second',
        'third',
    ])
})

