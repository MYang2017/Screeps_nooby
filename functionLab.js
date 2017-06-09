var compoundFormulae = {
  'H': ['O','OH'],
  'O': ['H','OH'],
  'U': ['L','UL'],
  'L': ['U','UL']
};

global.labRun = function(room) {
    let labs = room.find(FIND_MY_STRUCTURES, {filter: c => c.structureType == STRUCTURE_LAB});
    let inLabs = [];
    let outLabs = [];

    for (let lab of labs) {
        let flag = room.lookForAt(LOOK_FLAGS,lab)[0];
        if (flag != undefined) {
            if (flag.color == 4) { // 4 is cyan for out lab
                outLabs.push(lab);
            }
            else if (flag.color == 5) { // 5 is green for in labs
                inLabs.push(lab);
            }
        }
    }

    for (let outLab of outLabs) {
        if (outLab.mineralAmount < 3000) {
            outLab.runReaction(inLabs[0],inLabs[1]);
        }
    }
}

global.labWorkToDo = function(creep) {
    if (creep.memory.labWork == undefined) {
        creep.memory.labWork = {target: undefined, mineralType: undefined, keep: undefined};
    }
    let room = creep.room;
    let labs = room.find(FIND_MY_STRUCTURES, {filter: c => c.structureType == STRUCTURE_LAB});

    for (let lab of labs) {
        let flag = room.lookForAt(LOOK_FLAGS,lab)[0];
        if (flag != undefined) {
            if (flag.color == COLOR_CYAN) { // 4 is cyan for out lab
                if (lab.mineralAmount>100) {
                    creep.memory.labWork.target = room.terminal.id; // get compound to terminal
                    creep.memory.labWork.keep = lab.id // lab depleted
                    creep.memory.labWork.mineralType = getMineralType(flag.name);
                    return true;
                }
            }
            else if (flag.color == COLOR_GREEN) { // 5 is green for in labs
                if (lab.mineralAmount<100) {
                    creep.memory.labWork.target = lab.id; // get in-resource to lab
                    creep.memory.labWork.keep = room.terminal.id; // terminal depleted
                    creep.memory.labWork.mineralType = flag.name;
                    return true;
                }
            }
        }
    }
    return false
}

global.getMineralType = function(stringM) {
    let len = stringM.length;
    return stringM.substring(1,len)
}
