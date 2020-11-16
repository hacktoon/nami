import { Grid } from '/lib/grid'
import { Point } from '/lib/point'


test('grid position null value', () => {
    const grid = new Grid(1, 1)
    const p = new Point(0, 0)
    expect(grid.get(p)).toBe(null)
})


test('grid position return default value', () => {
    const grid = new Grid(1, 1, () => 'value')
    const p = new Point(0, 0)
    expect(grid.get(p)).toBe('value')
})


test('grid position set value', () => {
    const grid = new Grid(1, 1)
    const p = new Point(0, 0)
    grid.set(p, 'value')
    expect(grid.get(p)).toBe('value')
})
