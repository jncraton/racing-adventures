Block Representation
====================

Storage Format
--------------

|B64 Char   | Bits  | Value            |
| --------- | ----- | ---------------- |
| 1         | 0-3   | Block Type       |
| 1         | 4-5   | Block Style      |
| 2         | 0-5   | X Position       |
| 3         | 0-5   | Y Position       |
| 4         | 0-5   | Z Position       |

Block Types
-----------

- 0: Road   
- 1: 7.125 degree (1:8 pitch) Road ramp
- 2: Road Corner
- 3: Wall
- 4: Dirt (Plain or with three styles)

Block Styles
------------

- Usually orientation in cardinal directions (N, E, S, W)
- May also represent texture or model variations

Ideas
-----

### Path Representation

- Represent block connections as a graph
- Represent path via block order

### Storage Improvements

- Infer block direction from surrounding nodes
- Infer block position from surrounding nodes
