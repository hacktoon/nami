import { IndexMap } from '/lib/map'


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
