import { Graph } from '/lib/base/graph'


test('Add graph node', () => {
    const graph = new Graph()
    graph.addNode(1)
    expect(graph.hasNode(1)).toBe(true)
    expect(graph.hasNode(2)).toBe(false)
})


test('Check graph edge nodes', () => {
    const graph = new Graph()
    graph.addEdge(1, 2)
    expect(graph.hasNode(1)).toBe(true)
    expect(graph.hasNode(2)).toBe(true)
})


test('Test graph edges', () => {
    const graph = new Graph()
    graph.addEdge(1, 2)
    graph.addEdge(4, 3)
    expect(graph.hasEdge(1, 2)).toBe(true)
    expect(graph.hasEdge(3, 4)).toBe(true)
    expect(graph.hasEdge(4, 3)).toBe(true)
    expect(graph.hasEdge(1, 3)).toBe(false)
    expect(graph.hasEdge(3, 1)).toBe(false)
})
