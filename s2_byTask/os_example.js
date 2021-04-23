module.exports = {
    // Process List
    var pslist = [];


    // Very Basic Kernel
    module.exports.loop = function() {
    	_.remove(pslist, x=>!x.run);
    	for (const ps of _.shuffle(pslist)) {
    		if (Game.cpu.getUsed() > Game.cpu.tickLimit*0.5) { break; }
    		let ret = ps.fn();
    		if (ret == "kill") {
    			ps.run = false;
    		}
    	}
    }


    // We need to be able to add things to the process list to run.
    global.register = function(fn) {
    	pslist.push({fn, run: true});
    }


    // Example process, prints out game time until it reaches a tick ending in "00", then dies.
    register(function() {
    	console.log(Game.time);
    	if ((Game.time%100) == 0) { return "kill"; }
    });
};