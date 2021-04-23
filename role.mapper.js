module.exports = {
    run: function(creep) {
        let sayings = ['can', 'we', 'be', 'friends?'];
        creep.say(sayings[Game.time%4], true);
        
        logSymbolInfoToMem(creep.room);
        
        if (creep.memory.home == undefined) {
            creep.memory.home = creep.room.name;
        }
        
        // static mapper, do not move
        let tarRn = creep.memory.target;
        
        if (creep.ticksToLive==2) {
            if (creep.room.find(FIND_MY_CREEPS)<2) {
                Memory.mapInfo[tarRn].scannedBy.need = true;
            }
        }
        
        if (tarRn != undefined) {
            if (creep.room.name != tarRn) {
                // if not in target room, move to target room
                let route = Game.map.findRoute(creep.room, tarRn);
                let exit = creep.pos.findClosestByRange(route[0].exit);
                let exitRange = creep.pos.getRangeTo(exit);
                // if x is close to exit
                if (exitRange > 0) {
                    // get in
                    creep.travelTo(exit, {maxRooms: 1});
                }
            }
            else { // in target room
                creep.travelTo(new RoomPosition(25, 25, tarRn), {range: 23});
            }
        }
        else {
            // moving mapper
            if (creep.memory.target == undefined) {
                creep.memory.target = generateRoomnameWithDistance(creep.room.name);
            }
            
            let cx = creep.pos.x;
            let cy = creep.pos.y;
            
            if (cx!=0&&cy!=0&&cx!=49&&cy!=49) {
                let pp = creep.memory.pp;
                if (pp == undefined) {
                    creep.memory.target = generateRoomnameWithDistance(creep.memory.home);
                }
                else {
                    let px = pp.x;
                    let py = pp.y;
                    if (cx==px && cy==py) {
                        creep.memory.target = generateRoomnameWithDistance(creep.memory.home);
                    }
                }
            }
            creep.memory.pp = {x: cx, y: cy};
            
            
            if (creep.memory.target !== creep.room.name) { // current home is the same as previous home, still in home, go to another home
                // generate a new room to go
                const route = Game.map.findRoute(creep.room, creep.memory.target);
                let next = route[0];
                if(route.length > 0) {
                    const exit = creep.pos.findClosestByRange(route[0].exit);
                    let tryMove = creep.moveTo(exit, {maxRooms: 1});
                    if (tryMove == ERR_NO_PATH) {
                        creep.memory.target = generateRoomnameWithDistance(creep.memory.home);
                    }
                }
                else { // not valid, generate another room target
                    creep.memory.target = generateRoomnameWithDistance(creep.memory.home);
                }
            }
        }
    }
};

JSON.stringify(parseRoomName('W30N30'))