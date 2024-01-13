# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## PLANNING
- start a fill for each city,
- Each city can have only 4 neighbours (road portals)
  stop if found 4 neighbors
- start a fill for each capital
- city has a routing table
- each route has a id, cities,


### BlockLayer
- Calculate 3x3 surface code map to distribute % of erosion
- Start fill from river and block shore points


### BasinLayer
- Add basin types (plain, plateau, slope)
- Add erosion tree for all points
- Vary river source point for each block
- Add Watershed tree to basin


### General ideas
- Optimize canvas rendering
	- Use offscreen canvas
	- When map fills screen entirely, snap canvas to viewport,
    	otherwise translate canvas element
- create world types [medieval, cyberpunk, steampunk]
- Point
  - create a wrappedAdjacents similar to `Point.adjacents(parentPoint)` that receives a rect
- Create ArrayGrid
  - PointSets can be dependent on a rect to map points to indexes in a matrix, thus using integers instead of points - each index represents a point
- Solve `[Violation] 'input' handler` message by lazy evaluating commands


### CivilLayer
- Set city type using a fill from capital point
  - the bigger the distance of capital, less development on places
  - depending on realm type, can grow less or more cities
  - Put inns/outposts at borders of city radius
- Cities next to salt lakes are ruins
- Each city in block map can occupy tiles as zones or neighborhoods
- Dungeon types and levels like cat quest
  - dungeons at high level like 79
- Add city ruins on dry rivers or dry land
- Start a fill to determine city area
- create junction points between two route points to set midpath detours
  - follow road and calc nearest junction start


### LandformLayer
  - type of stretch often make waterfalls or rapids
  - canyon / volcano / reef


### SociologyLayer
- Start a fill on capitals to determine realms territory
-


### RainLayer
- Make rain dynamic using noise offset and season `temp.get(point, season)`


## INSPIRATIONS
- https://twitter.com/datassette/status/1624394179185938432

