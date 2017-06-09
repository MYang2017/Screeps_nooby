global.observerObserveRoom = function(observerRoomName, toObserveRoomName) {
    let observer = Game.rooms[observerRoomName].find(FIND_MY_STRUCTURES, {filter: c=> c.structureType == STRUCTURE_OBSERVER})[0];
    observer.observeRoom(toObserveRoomName);
}
