module.exports = {
    run: function (creep) {
        
        let onTaskId = creep.memory.moveTaskId;

        if (onTaskId !== undefined) { // creep have contract id
            if (creep.room.memory.taskMove == undefined || creep.room.memory.taskMove.contracts == undefined) { // no contract structure
                creep.memory.moveTaskId == undefined; // remove stored id
                return false
            }
            let contract = creep.room.memory.taskMove.contracts[onTaskId];
            if (contract) { // task still there, do task
                let askerName = contract.askerName;
                let askerCreep = Game.creeps[askerName];
                if (askerCreep) { // if asker still alive
                    
                    if (creep.pos.getRangeTo(askerCreep) > 1) { // if not pull range to to asker
                        creep.travelTo(askerCreep);
                    }
                    else { // if in pull range move to target and pull
                        let tarPosi = contract.posi;
                        if ((creep.pos.x == tarPosi.x) && (creep.pos.y == tarPosi.y)) { // if at working position, last pull move
                            creep.pull(askerCreep);
                            creep.move(askerCreep);
                        }
                        else { // if not at working position go to it
                            creep.room.visual.circle(askerCreep.pos, {fill: 'transparent', radius: 0.55, stroke: 'white', strokeWidth: 0.5});
                            creep.room.visual.circle(creep.pos, {fill: 'transparent', radius: 0.55, stroke: 'red', strokeWidth: 0.5});
                            creep.pull(askerCreep);
                            /*let foundi = creep.room.lookForAt(LOOK_CREEPS, tarPosi.x, tarPosi.y);
                            if (foundi.length>0) {
                                if (foundi[0].memory.role == 'mover') {
                                    actionAvoid.run(foundi[0]);
                                    creep.moveTo(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));
                                }
                                else if (foundi[0].memory.role == 'noLegWorker') {
                                    creep.move(Math.floor(Math.random() * 8) +1);
                                }
                            }
                            else {
                                creep.moveTo(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));
                            }*/
                            //creep.travelTo(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));

                            //creep.moveToWhenNeverTar(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name))
<<<<<<< HEAD
                            creep.travelTo(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name), {creepCost: 3});
=======
                            creep.travelTo(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));
>>>>>>> master
                            //creep.moveToAvoidAllOtherCreeps(new RoomPosition(tarPosi.x, tarPosi.y, creep.room.name));
                        }
                    }
                    return true
                }
                else { // asker dead, remove task
                    creep.memory.moveTaskId = undefined;
                    delete creep.room.memory.taskMove.contracts[onTaskId];
                    return false
                }
            }
            else { // contract is not there, clear own task
                creep.memory.moveTaskId = undefined;
                return false
            }
        }
        else {
            // publish offer, better logic dont take multiple tasks same time <<<<<<<<<<<<<<<<<<<<
            if (!creep.room.memory.taskMove.offers.includes(creep.name)) {
                creep.room.memory.taskMove.offers.push(creep.name);
            }
            if (!creep.room.memory.taskE.offers.includes(creep.id)) {
                creep.room.memory.taskE.offers.push(creep.id);
            }
            if (!creep.room.memory.taskGetE.offers.includes(creep.id)) {
                creep.room.memory.taskGetE.offers.push(creep.id);
            }
            return false
        }
    }
}
