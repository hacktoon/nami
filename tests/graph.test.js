import { expect, test } from 'vitest'
import { Graph } from '/src/lib/graph'


test('Add graph node', () => {
    const graph = new Graph()
    graph.addNode(1)
    expect(graph.hasNode(1)).toBe(true)
    expect(graph.hasNode(2)).toBe(false)
})


test('Check graph edge nodes', () => {
    const graph = new Graph()
    graph.setEdge(1, 2)
    expect(graph.hasNode(1)).toBe(true)
    expect(graph.hasNode(2)).toBe(true)
})


test('Test graph edges', () => {
    const graph = new Graph()
    graph.setEdge(1, 2)
    graph.setEdge(4, 3)
    expect(graph.hasEdge(1, 2)).toBe(true)
    expect(graph.hasEdge(3, 4)).toBe(true)
    expect(graph.hasEdge(4, 3)).toBe(true)
    expect(graph.hasEdge(1, 3)).toBe(false)
    expect(graph.hasEdge(3, 1)).toBe(false)
})


test('Test graph node removal', () => {
    const graph = new Graph()
    graph.setEdge(1, 2)
    graph.setEdge(1, 3)
    graph.setEdge(2, 3)
    expect(graph.hasEdge(3, 1)).toBe(true)
    graph.deleteNode(3)
    expect(graph.hasEdge(3, 1)).toBe(false)
    graph.deleteNode(1)
    expect(graph.hasEdge(2, 1)).toBe(false)
    expect(graph.hasNode(2)).toBe(true)
    expect(graph.hasNode(1)).toBe(false)
    expect(graph.hasNode(3)).toBe(false)
})
