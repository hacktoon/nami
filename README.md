# NAMI: World Generator


## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP



#### TectonicsMap
- Pass RegionMap setValue to send noise point to generate continents in plate
- Create PlateMatrix
  - For each region origin => set noise for each scanline fill
- Create plate adjacency from regiongroup map
  - Convergent
    - OO : Island Arc + trench
    - OC : Trench + Orogeny
    - CC : Mountain

  - Divergent
    - OO : Oceanic Ridge
    - CC : Rift

#### TerrainMap
- Define litoral/water/plains/mountain/hill regions
- Calc river basins from region graph
- Build distance map from coast borders
- Use ScanlineFill to discover areas
- Set id's on Matrix during scanline fill

#### (MAYBE) ErosionMap
- Eliminate hard/pointy edges - smooth terrain
- discover river paths
  - Start from river mouth points, flood fill

#### TemperatureMap
- Use two opposite points on regionMap
- Value range: -50:50

#### WindMap
- Value range: 0:10, varies according to month

#### RainMap
- Annual range: changes over month - winter/summer
- Value range: 0:10, varies according to month and windmap

#### Other
- Create Schema inside static method `create` to use data like `region.count`
- Set identity point method for Direction class
- Vegetation/wildlife density: adjusted by humidity, temperature and height
- Roads
  - create junction points between route ends to set midpath detours

### Interface
- Optimize canvas rendering
  - Use offscreen canvas when `map.size <  screen.size`
  - Add tool to live-test drawing functions on console
- Solve `[Violation] 'input' handler` message by storing commands