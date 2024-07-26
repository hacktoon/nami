# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## PLANNING
- ZoneMap
  - Create basin midpoint offset
  - steps after region fill - setting regions' surface type by priority:
    - Order of zone steps: roads > rivers > erosion
- simplify cities into "city seeds"
- conclude wrapGet migration for grids


### General ideas
- Optimize canvas rendering
	- Use offscreen canvas
	- When map fills screen entirely, snap canvas to viewport,
    	otherwise translate canvas element
- create world types [medieval, cyberpunk, steampunk]
- Solve `[Violation] 'input' handler` message by lazy evaluating commands


### CivilLayer
- Set city type using a fill from capital point
  - Put inns/outposts at borders of city radius
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

