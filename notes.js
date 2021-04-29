/*
room plan: https://gist.github.com/xyzzy529/df3b39f4d552da5dd4f829dfcda06fa8
https://screeps.com/forum/topic/1024/useful-utilities

find tower and wall/rampart positions (1?
road cach

spawnQueueTimer rethink

remote mining room exclude overlapped rooms

red neck favour moving in rampart

intershard expand (*)


rednecks
	ranged
	dynamic number
	cancel spawn
	tower colab
room indangerstate and reduce spawning requirement for pickuper


granafal granofa?

subroom
	determine spawn posi and place after claim (very advanced and late game...)
	poineer and local screeps balancing

auto subroom, first spawn (1



things need to change:
spawn with direction


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

*/