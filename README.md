# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## PLANNING

### General
- create world types [medieval, cyberpunk, steampunk]
- Get zoom on draw methods of Diagram
	- Make it a parameter for detailed rendering (world, block)
- Optimize canvas rendering
	- Use offscreen canvas
	- When map fills screen entirely, snap canvas to viewport,
    	otherwise translate canvas element
- Point
  - create a wrappedAdjacents similar to `Point.adjacents(parentPoint)` that receives a rect
- Create ArrayGrid
- PointSets can be dependent on a rect to map points to indexes in a matrix, thus using integers instead of points
- Create ContinentLayer (maybe)
  - Use 32x32 tilemap with regionMap borders for separating landmasses
  - border points get a grained island noise
- Solve `[Violation] 'input' handler` message by lazy evaluating commands


### LandformLayer
  - type of stretch often make waterfalls or rapids
  - canyon / volcano / reef


### RainLayer
- Make rain dynamic using noise offset and season `temp.get(point, season)`


### TopologyLayer
- Cities next to salt lakes are ruins
- Set city type using a fill from capital point
- Each city in block map can occupy tiles as zones or neighborhoods
- Dungeon types and levels like cat quest
  - dungeons at high level like 79
- Add city ruins on dry rivers or dry land
- Start a fill to determine city area
- connect sites inside a radius
- create junction points between two route points to set midpath detours
  - follow road and calc nearest junction start


### SociologyLayer
- Start a fill on capitals to determine realms territory


## INSPIRATIONS
- https://twitter.com/datassette/status/1624394179185938432

