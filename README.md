# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## PLANNING

### General
- Get zoom on draw methods of Diagram
	- Make it a parameter for detailed rendering
- Optimize canvas rendering
	- Use offscreen canvas
	- When map fills screen entirely, snap canvas to viewport,
    	otherwise translate canvas element
- Solve `[Violation] 'input' handler` message by lazy evaluating commands
- Point
  - create a wrappedAdjacents similar to `Point.adjacents(parentPoint)` that receives a rect

### WorldTileMap
- Each chunk has 4 spawn points and a default (e.g. when player uses teleport)
- Cities start more often on outer borders of land
- Make temperature dynamic using noise offset and season `temp.get(point, season)`
- Create ContinentLayer (maybe)
  - Use 32x32 tilemap with regionMap borders for separating landmasses
  - border points get a grained island noise

### HydrologyLayer
- Create types of lakes (swamp, pond, well)
- Set river type on flow to avoid `#buildRiverWidth` function on Diagram
- River that start on small seas can't go much further
- Height of terrain often make waterfalls or rapids

### TopologyLayer
- Determine capitals and villages
- Start a fill to determine realm area
- connect sites inside a radius
- create junction points between two route points to set midpath detours
  - follow road and calc nearest junction start

### SociologyLayer
- Start a fill on capitals to determine realms territory


## INSPIRATIONS
- https://twitter.com/datassette/status/1624394179185938432

