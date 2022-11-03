Block Representation
====================

Storage Format
--------------

|B64 Char   | Bits  | Value            |
| --------- | ----- | ---------------- |
| 1         | 0-3   | Block Type       |
| 1         | 4-5   | Block Direction  |
| 2         | 0-5   | X Position       |
| 3         | 0-5   | Y Position       |
| 4         | 0-5   | Z Position       |

Block Types
-----------

- 0: Road   
- 1: 7.125 degree (1:8 pitch) Road ramp

