import { Graph } from '/lib/base/graph'


test('Add graph vertex', () => {
    const graph = new Graph()
    graph.addVertex(1)
    expect(graph.hasVertex(1)).toBe(true)
})
