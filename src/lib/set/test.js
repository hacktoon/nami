import { IndexSet } from '/lib/set'


test("indexSet initialization", () => {
    const indexSet = new IndexSet(['a', 'b', 'c'])
    expect(indexSet.getIndex('a')).toBe(0)
    expect(indexSet.getIndex('b')).toBe(1)
    expect(indexSet.getIndex('c')).toBe(2)
})


test("indexSet delete item", () => {
    const indexSet = new IndexSet(['a', 'b', 'c'])
    expect(indexSet.has('b')).toBe(true)
    indexSet.delete('b')
    expect(indexSet.has('a')).toBe(true)
    expect(indexSet.has('c')).toBe(true)
    expect(indexSet.has('b')).toBe(false)
})


test("indexSet item size after delete", () => {
    const indexSet = new IndexSet(['a', 'b', 'c'])
    expect(indexSet.size).toBe(3)
    indexSet.delete('b')
    expect(indexSet.size).toBe(2)
})


test("indexSet index changes after delete", () => {
    const indexSet = new IndexSet(['a', 'b', 'c'])
    expect(indexSet.getIndex('c')).toBe(2)
    indexSet.delete('b')
    expect(indexSet.getIndex('c')).toBe(1)
})
