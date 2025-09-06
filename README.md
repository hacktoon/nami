# NAMI: World Generator

## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP

- refactor civil model
- set biome as {
    temp > x
    rain > 4
  }

- create secondary biomes for chunks (with region grid)
- conclude wrapGet migration for grids


### General ideas
- Optimize canvas rendering
	- Use offscreen canvas
	- When map fills screen entirely, snap canvas to viewport,
    	otherwise translate canvas element
- create world types [medieval, cyberpunk, steampunk]
- Solve `[Violation] 'input' handler` message by lazy evaluating commands


### CivilLayer
- Each city in chunk map can occupy tiles as chunks or neighborhoods
- Dungeon types and levels like cat quest
  - dungeons at high level like 79
- Add city ruins on dry rivers or dry land
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

