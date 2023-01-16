import { expect, test } from 'vitest'
import { Matrix } from '/src/lib/matrix'


test('Matrix position null value', () => {
    const matrix = new Matrix(1, 1)
    const p = [0, 0]
    expect(matrix.get(p)).toBeNull()
})


test('Matrix position return default value', () => {
    const matrix = new Matrix(1, 1, () => 'value')
    const p = [0, 0]
    expect(matrix.get(p)).toBe('value')
})


test('Matrix position set value', () => {
    const matrix = new Matrix(1, 1)
    const p = [0, 0]
    matrix.set(p, 'value')
    expect(matrix.get(p)).toBe('value')
})
