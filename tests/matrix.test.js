import { assert, describe, expect, it } from 'vitest'
import { Matrix } from '/src/lib/matrix'


it('Matrix position null value', () => {
    const matrix = new Matrix(1, 1)
    const p = [0, 0]
    assert.equal(matrix.get(p), null)
})


it('Matrix position return default value', () => {
    const matrix = new Matrix(1, 1, () => 'value')
    const p = [0, 0]
    expect(matrix.get(p)).toBe('value')
})


it('Matrix position set value', () => {
    const matrix = new Matrix(1, 1)
    const p = [0, 0]
    matrix.set(p, 'value')
    expect(matrix.get(p)).toBe('value')
})
