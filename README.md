# NAMI: World Generator


## DEMO

[https://hacktoon.github.io/nami/](https://hacktoon.github.io/nami/)


## ROADMAP
* add geologic features in plates borders (on each side)
  * build regions adjacency table
  * mountains, rifts, trenches, faults, none
  * use horizontal/vertical height differentiation for each opposing direction in the borders
* build distance map from coast borders
* WaterMap
  * Set id's on Grid during scanline fill
  * Decide it's type when finished, set type on object WaterBody
  * Values: 0:none, 1:river, 2:lake, 3:sea, 5:ocean
  * WaterBody
    * Reference point - where fill started, used to scanline again for searches
* vegetation/wildlife density: adjusted by humidity, temperature and height
* add cities
* add roads
  * create junction points between route end
