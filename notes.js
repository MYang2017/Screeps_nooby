/*
<<<<<<< HEAD
room plan: https://gist.github.com/xyzzy529/df3b39f4d552da5dd4f829dfcda06fa8
https://screeps.com/forum/topic/1024/useful-utilities

find tower and wall/rampart positions (1?
road cach

spawnQueueTimer rethink

remote mining room exclude overlapped rooms

=======

miner fill extension if have carry
mover put nleg beside site
upgrade point
mover put energy beside upgrade point(drop/container fill)
twoer
rewrite structure energy

room plan: https://gist.github.com/xyzzy529/df3b39f4d552da5dd4f829dfcda06fa8

storage position plan (1
find tower and wall/rampart positions (1?
road fucked up
	cach
in pathfinding of placing sites, use anchor point instead of spawn

spawnQueueTimer rethink
	balance clearing and wait timer to check again
grandeloginfo, log mineral in centre rooms, becareful with other type (power, xxx)

remote mining room exclude overlapped rooms

link

second tower build

stop wallupgraders when room low e

longdistancebuilder give way

longdistance lorry spawn when container ready

>>>>>>> master
red neck favour moving in rampart

intershard expand (*)

<<<<<<< HEAD
=======
rework miner to build extension and fill extension (need new room plan?) (*)

fill task (***********************), currently for pickuper lorry, later longdistant...

room plan (**)

resource flow (**), terminals
>>>>>>> master

rednecks 
	ranged
	dynamic number
	cancel spawn
	tower colab
<<<<<<< HEAD
room indangerstate and reduce spawning requirement for pickuper
=======
>>>>>>> master


granafal granofa?

subroom
	determine spawn posi and place after claim (very advanced and late game...)
	poineer and local screeps balancing

<<<<<<< HEAD
auto subroom, first spawn (1
=======
scouter spawn and log with time
auto subroom, first spawn (1
roomindangerstate and reduce spawning requirement for pickuper
>>>>>>> master



things need to change:
spawn with direction
<<<<<<< HEAD


<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
Maintainer
storage and terminal logic
resource flow (**), terminals
terminal/terminator to move energy and symbol around

<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
generate best room for symbol

<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
boost logic
lab logic



////////// new path finding

register room exit pos function for scout (implement timer to update every now and then)
loadExitFromToTo()
input: fromRoomName, toRoomName
return: r1pos, r2pos

check if fromRoomName + toRoomName exists
if exists
	load and return a, b
else
	check if toRoomName + fromRoomName exists
	if exists
		return b, a
	else // find path and log
		if fromRoomName is mine
			get spawn, anchor, site positions as fromPos
		else
			if res
				get res pos as toPos
			else
				use mid pos as toPos
		findPath fromPos -> toPos (ignore creeps, include structures/walls/terrain... road = 1, plane is 2 swamp is 10)
		use the path between roomNames as a and b
return a, b


// replace traveler for cached move
creep.moveLDL(toPos); 

input: current pos, target pos, 
return: a path in the current room

let storedPath = creep.memory.storedPath
if storedPath.length>0
	moveAndUpdatePath(cp)
else
	moveNewNyPath(cp)

moveNewNyPath():
if target pos not in same room as current pos
	find next room going to by route
	loadExitFromToTo()
	if loaded
		creep.memory.storedPath = findPath
		moveAndUpdatePath(cp)
	else // not recorded yet
		travelTo(25, 25, nextroom)
else // in same room
	creep.memory.storedPath = findPath
	moveAndUpdatePath(cp)

moveAndUpdatePath(cp)
let p = creep.memory.storedPath;
let res = creep.moveTo(p[0]);
if OK
	creep.memory.storedPath.splice(0,1)
else 
	wait

findPath(fromPos, toPos)
 (ignore creeps, include structures/walls/terrain... road = 1, plane is 2 swamp is 10)
return path


todo: s

todo after season:
digger position is next to final target


battle logic of quads

symbol flow in E11S16
lab bug?
Z flow to E1S27
=======
early room
    upgrade container
    staticUpgrader

dickHeads + linkeepr rework




































>>>>>>> master

*/