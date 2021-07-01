# NAMI: World Generator


## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
#### TerrainTileMap
- Define litoral/water/plains/mountain/hill regions
- Calc river basins from region graph
- Build distance map from coast borders
- Use ScanlineFill to discover areas
- Set id's on Matrix during scanline fill

#### (MAYBE) ErosionMap
- Use TerrainTileMap
- Eliminate hard/pointy edges - smooth terrain
- discover river paths
  - Start from river mouth points, flood fill

#### WindTileMap
- Use TemperatureTileMap

#### RainTileMap
- Use WindTileMap
- Annual range: changes over month - winter/summer
- Value range: 0:10, varies according to month and windmap

#### RealmTileMap
- Use RegionTileMap
- Grow cities' territory
  - discover routes
- Some may be unclaimed

#### Other
- Vegetation/wildlife density: adjusted by humidity, temperature and height
- Roads
  - create junction points between two route points to set midpath detours

### Interface
- Cache map values in localStorage
- Optimize canvas rendering
  - Use offscreen canvas when `map.size <  screen.size`
  - Add tool to live-test drawing functions on console
- Solve `[Violation] 'input' handler` message by storing commands