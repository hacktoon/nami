import { expect, test } from 'vitest'
import { Grid } from '/src/lib/grid'


test('Grid position null value', () => {
    const grid = new Grid(1, 1)
    expect(grid.get([0, 0])).toBeNull()
    expect(grid.get([2, 0])).toBeNull()
})


test('Grid position return default value', () => {
    const grid = new Grid(2, 1, () => 'value')
    expect(grid.get([0, 0])).toBe('value')
    expect(grid.get([1, 0])).toBe('value')
})


test('Grid position set value', () => {
    const grid = new Grid(2, 3)
    const ps = [[0, 1], [1, 0], [5, -8]]
    for (let p of ps) {
        grid.set(p, `${p}`)
        expect(grid.get(p)).toBe(`${p}`)
    }
})


test('Grid area', () => {
    const grid1 = new Grid(3, 3)
    const grid2 = new Grid(2, 3)
    expect(grid1.area).toBe(9)
    expect(grid2.area).toBe(6)
})


test('Grid wrapping', () => {
    const grid = new Grid(2, 2)
    const point1 = grid.wrap([2, 2])
    const point2 = grid.wrap([3, 2])
    const point3 = grid.wrap([2, 3])
    const point4 = grid.wrap([-7, 4])
    expect(point1).toStrictEqual([0, 0])
    expect(point2).toStrictEqual([1, 0])
    expect(point3).toStrictEqual([0, 1])
    expect(point4).toStrictEqual([1, 0])
})
