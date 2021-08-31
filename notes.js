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


********************** MVR trading
class Market {
  constructor() {
    console.log("Refreshing Market Prices");
    RESOURCES_ALL.forEach(r => {
      const tryMkt = Game.market.getHistory(r);
      if(tryMkt && tryMkt.length > 0) {
        const mktHist = tryMkt.reverse()
        let obj = {};
        let i = 1;
        let avg = 0;
        if(mktHist) {
          mktHist.forEach(d => {
            avg+= d.avgPrice;
            if(i === 1) {
              obj.dailyAvg = avg / i;
            }
            if(i === 3) {
              obj.movingAvg3 = avg / i;
            }
            if(i === 7) {
              obj.movingAvg7 = avg / i;
            }
            if(i === 14) {
              obj.movingAvg14 = avg / i;
            }
            i++;
          })
          obj.minSell = Math.min(...Game.market.getAllOrders({ type: ORDER_SELL, resourceType: r}).map(x => x.price));
          obj.maxBuy = Math.max(...Game.market.getAllOrders({ type: ORDER_BUY, resourceType: r }).map(x => x.price));

          //to do, calc a more dynamic value
          obj.value = obj.dailyAvg;

          //calc raw cost of processed resources based on all individual part costs
          const c = COMMODITIES[r];
          if(c) {
            let rawCost = 0;
            Object.keys(c.components).forEach(k => {
              if(this[k]) rawCost += (this[k].value * (c.components[k] / c.amount));
              else rawCost = null
            })
            obj.rawCost = rawCost;
          }
          const b = BOOST_COMPONENTS[r];
          if(b) {
            let rawCost = 0;
            b.forEach(i => {
              if(rawCost != null) {
                if(this[i] && this[i].value)
                  rawCost += (this[i].value);
                else
                  rawCost = null
              }
            })
            obj.rawCost = rawCost;
          }
          this[r] = obj;
        }
      }
    })
  }
}

module.exports = Market;

then you can access any value like global.Market[RESOURCE_ENERGY].value
1:31
oh right and this in main outside of the loop:
const Market = require('Market');
 global.Market = new Market();
1:31
it just updates on global resets/code uploads
1:31
could obviously code for more frequenty/regular updates if wanted
1:32
mostly i just never had a good idea for how to implement a value that wasn't just the daily average.... sure i have better historic data with 7 day average or whatever, but if XGH2O is selling higher today and i just try to use the 7 day average, i'm probably just not going to be able to buy any


//Organisms
      if(this.terminal.store[RESOURCE_ORGANISM] > 0) {
        const maxBuy = GetMaxBuy(RESOURCE_ORGANISM);
        if(global.Market[RESOURCE_ORGANISM] && global.Market[RESOURCE_ORGANISM].value && maxBuy) {
          const q = Math.min(this.terminal.store[RESOURCE_ORGANISM], maxBuy.remainingAmount)
          if(maxBuy.price >= global.Market[RESOURCE_ORGANISM].value && q > 0) {
            console.log('Selling ' + q + ' ' + RESOURCE_ORGANISM + ' for ' + maxBuy.price + ' (est. value: ' + global.Market[RESOURCE_ORGANISM].value + ')');
            Game.market.deal(maxBuy.id, q, this.name)
          }
        }
      }


// next todos: 
reremote mining
    :(
boost manufactoring
post for sell other type of commo
    check if we only sell regional commo
make liquids
    the commos that only required bars (and with/w.o. flvl)
boost mats for VIP (res flow, auto super boost)
    VIP room needs G series
    other rooms 'over' them
quads flee damage calculation
    when surrounding incoming damage is higher than a threshold (heal, tough dpd.), flee, other wise go to target
inc dmg for a creep at a point
    (could be for defence or attack)
    -> defence = my towers in room + red necks in range 1
    -> attack = enemy towers in room + attacks at range 1 + attacks with 0 fatigue at range 2 + ranged with fatigue in range 3 + ranged with 4 fatigue in range 4 (-1 dist) 
    TH = front active tough raw health
    FEH = front effective health
    DTT = damage to take
    SH = surrounding heals
    if (TH>=FEH) { // all damage can't penetrate
        DTT = inc*GO.coef
    }
    else { // incoming damage penetrates tough
        DTT = TH + (inc - TH/GO.coef)
    }
    if (DTT>=SH) {
        flee from current target with all hostile creeps and structrues to avoid
    }
    else {
        proceed moving to current target
    }
    functions:
        tower damage at point
        [DTT] = (creep body, current health, incoming damage)
        heal surround at point
    

tower
quads body calculator
GH res flow
superupgrader boost
pc logic + multiple sources
pc disrupt spawn attack
    logic
    healer
    deliveroo

*/