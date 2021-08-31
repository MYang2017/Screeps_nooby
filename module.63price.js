/**
 *  价格计算模块：
 *  这里只提供这个方法：
 *  StrategyMarketPrice.getSellPrice()
 *  返回一个map key是资源 value是售价 单位cr
 */
 
Array.prototype.flat= function(){return _.flatten(this)};
// Array.prototype.reduce= function(func){return _.reduce(this,func)};
Array.prototype.zip= function (another){return _.zip(this,another)};
Array.prototype.contains= function (another){return _.contains(this,another)};
Array.prototype.take= function (n){return _.take(this,n)};
Array.prototype.head= function(){return _.head(this)};
Array.prototype.last= function(){return _.last(this)};
Array.prototype.without= function(...e){return _.without(this,...e)};
Array.prototype.log= function(){console.log(JSON.stringify(this));return this};

let COMPRESSION_SET = new Set([RESOURCE_UTRIUM_BAR,RESOURCE_LEMERGIUM_BAR,RESOURCE_KEANIUM_BAR,RESOURCE_ZYNTHIUM_BAR,RESOURCE_GHODIUM_MELT,RESOURCE_OXIDANT,RESOURCE_REDUCTANT,RESOURCE_PURIFIER,RESOURCE_BATTERY]);
let BASE_RESTYPE = new Set([RESOURCE_ENERGY,"U","L","K","Z","X","O","H","ops"])
let BLUE = [RESOURCE_DEVICE,RESOURCE_CIRCUIT,RESOURCE_MICROCHIP,RESOURCE_TRANSISTOR,RESOURCE_SWITCH,RESOURCE_WIRE];
let BROWN = [RESOURCE_MACHINE,RESOURCE_HYDRAULICS,RESOURCE_FRAME,RESOURCE_FIXTURES,RESOURCE_TUBE,RESOURCE_ALLOY];
let PURPLE = [RESOURCE_ESSENCE,RESOURCE_EMANATION,RESOURCE_SPIRIT,RESOURCE_EXTRACT,RESOURCE_CONCENTRATE,RESOURCE_CONDENSATE];
let GREEN = [RESOURCE_ORGANISM,RESOURCE_ORGANOID,RESOURCE_MUSCLE,RESOURCE_TISSUE,RESOURCE_PHLEGM,RESOURCE_CELL];
let DEPO_MAP = (function (){
    let mp = {};
    BLUE.forEach(e=>mp[e] = RESOURCE_SILICON);
    BROWN.forEach(e=>mp[e] = RESOURCE_METAL);
    PURPLE.forEach(e=>mp[e] = RESOURCE_MIST);
    GREEN.forEach(e=>mp[e] = RESOURCE_BIOMASS);
    return mp;
})();

let PRICE_TOLERANCE = 0.1 // 10% 卖商品的时候允许价格和 最高的那个商品价格差多少的时候才卖，利润最大化
let DEPO_SET = new Set(BLUE.concat(BROWN).concat(PURPLE).concat(GREEN))
// 挖一个的成本大概在3.8 - 5 左右 取决于boost没有 s2 和 s3， 能量价格也不一样，挖到多少不挖也不一样，见仁见智吧
// 挖到100 大概成本是3.8-7左右
let DEFAULT_DEPO_PRICE =  5// 默认成本价格 ，这个不会从市场算了，市场买的价格虚高
let DEFAULT_PRICE = // 默认资源价格//如果不能从市场算的话//所有资源都会从这边算//如果低于这个价格按这个价格算
    (function () {
        if(Game.shard.name=="shard3")
            return  {"energy":0.5, "U":1.5, "L":0.5, "K":0.7, "Z":0.3, "X":4, "O":0.5, "H":1.1,"ops":1,}
        if(Game.shard.name=="Screeps.Cc")
            return  {"energy":1, "U":0.3, "L":0.3, "K":0.3, "Z":0.3, "X":0.95, "O":0.1, "H":0.1,"ops":1,}
        else
            return {"energy":1.5, "U":1.8, "L":1, "K":1, "Z":1, "X":8, "O":1.8, "H":1,}
})();

let MAX_DELAY = 86400/16 ; // 更新商品价格的延迟  大概6小时跟新一次



let pro = {
    _lastTick : -1e9, //上次更新时间
    // _baseResPrice:{},// 基础资源价格
    _depoResPrice:{},// 商品交易价格
    _depoResPriceStddev:{},// 商品交易方差
    _avgBaseDepoProfit:{},// 平均每个基础商品的交易利润

    // 计算合成需要的资源，计算利润
    _depoNeedPerCommodity : {},// 商品合成需要多少 单位基础商品
    _depoCostPerCommodity : {},// 商品合成需要多少cr 单位在每个基础商品上需要花多少额外资源的价格

    _depoSellPrice :{},// final sell price

    getSellPrice: function (){
        pro.updatePrice();
        // log( pro._depoSellPrice)
        return pro._depoSellPrice;
    },

    updatePrice:function (){
        if(pro._lastTick>=Game.time)return;
        // let time = Game.cpu.getUsed();
        pro.updateDepoPrice();
        pro.updateDepoHistroyPrice();
        pro.updateSellPrice()
        pro._lastTick=Game.time+MAX_DELAY;
        // log(Game.cpu.getUsed() - time) // 更新一次 大概消耗 2cpu
    },

    updateSellPrice:function () {
        let profitMap = {}
        pro._depoSellPrice = {};
        for(let k in DEPO_MAP){
            let avgProfit = pro._avgBaseDepoProfit[DEPO_MAP[k]];// 同系列单个商品平均利润
            // let resProfit = (pro._depoResPrice[k] + pro._depoResPriceStddev[k]*2 )/pro._depoNeedPerCommodity[k] //当前商品单个商品平均利润
            // if ( resProfit >= avgProfit) {
            let minSellPrice = Math.max(
                pro._depoResPrice[k] - pro._depoResPriceStddev[k]*2, // 最少需要的价格
                (pro._depoCostPerCommodity[k]+avgProfit)*pro._depoNeedPerCommodity[k]
            );
            let profit = minSellPrice/pro._depoNeedPerCommodity[k] - pro._depoCostPerCommodity[k];
            // console.log(k,pro._depoResPrice[k],minSellPrice,profit)
            profitMap[k] = profit;
            if(profit>DEFAULT_DEPO_PRICE*1.5)pro._depoSellPrice[k] = minSellPrice;// 必须有的赚才卖

            // }
        }


        [BLUE,BROWN,PURPLE,GREEN].forEach(series=>{ // delete the less profit sell price
            let maxPrice = 0;
            series.forEach(e=>{if(maxPrice < profitMap[e])maxPrice = profitMap[e]})
            series.forEach(e=>{if(maxPrice*(1-PRICE_TOLERANCE) > profitMap[e])delete pro._depoSellPrice[e]})
        })

    },

    getHistory() {
        return Game.market.getHistory();//historys //
    },

    updateDepoHistroyPrice: function (){
        let historyOrders =  pro.getHistory();

        let amount = {}
        let priceSum = {}
        let stddevDays = {}
        let stddev = {}
        historyOrders.forEach(e=>{
            if(!DEPO_SET.has(e.resourceType))return;
            priceSum[e.resourceType] = ( priceSum[e.resourceType] || 0 ) + e.avgPrice*e.volume;
            amount[e.resourceType] = ( amount[e.resourceType] || 0 ) + e.volume;
            stddevDays[e.resourceType] = (stddevDays[e.resourceType]||0)+1;
            stddev[e.resourceType] = (stddev[e.resourceType]||0)+e.stddevPrice;
        });

        let depoResPrice = {};
        let depoResPriceStddev = {};
        let sumBaseDepoProfit = {};
        let cntBaseDepoProfit = {};
        for(let resType in priceSum) {
            let BaseDepo = DEPO_MAP[resType];

            depoResPrice[resType] = priceSum[resType]/amount[resType] ;
            depoResPriceStddev[resType] = stddev[resType]/stddevDays[resType];
            sumBaseDepoProfit[BaseDepo] = (sumBaseDepoProfit[BaseDepo]||0) + priceSum[resType] - pro._depoCostPerCommodity[resType]* pro._depoNeedPerCommodity[resType]*amount[resType];
            cntBaseDepoProfit[BaseDepo] = (cntBaseDepoProfit[BaseDepo]||0) + amount[resType] * pro._depoNeedPerCommodity[resType];
        }
        let avgBaseDepoProfit = {}
        for(let resType in sumBaseDepoProfit) {
            avgBaseDepoProfit[resType] = sumBaseDepoProfit[resType]/cntBaseDepoProfit[resType]
        }
        pro._depoResPrice = depoResPrice;
        pro._depoResPriceStddev = depoResPriceStddev;
        pro._avgBaseDepoProfit = avgBaseDepoProfit;
        // log(depoResPrice);
        // log(depoResPriceStddev);
        // log(avgBaseDepoPrice);

    },
    getBaseResTypeHistory :function (){ // 基础资源的价格
        let historyOrders =  pro.getHistory();
        let history = {}
        historyOrders.forEach(e=>{
            if(BASE_RESTYPE.has(e.resourceType))return;
            if(e.stddevPrice>e.avgPrice&&e.stddevPrice>=1)return; // 排除有些人挂单换cr
            // if(e.date==date)return;// 排除当天交易
            if(!history[e.resourceType])
                history[e.resourceType] = [];
            history[e.resourceType].push(e)
        })
        let out = {}
        for(let resType of BASE_RESTYPE){
            let hisArr = history[resType];
            if(hisArr){
                let avg = _.sum(hisArr.map(e=>e.avgPrice))/hisArr.length
                if(avg>DEFAULT_PRICE[resType])out[resType] = avg;
                else out[resType] = DEFAULT_PRICE[resType];
            }else {
                out[resType] = DEFAULT_PRICE[resType]
            }
        }

        // Object.entries(priceSum).sort((a,b)=>a[1]-b[1]).map(e=>[e[0],e[1],e[1]/amount[e[0]],amount[e[0]]]).forEach(e=>console.log(e));
        return out
    },
    updateDepoPrice : function(){ // 计算合成的成本
        let BASE_DEPOSITS = [RESOURCE_SILICON,RESOURCE_BIOMASS,RESOURCE_METAL,RESOURCE_MIST];
        let price = pro.getBaseResTypeHistory();
        let getPrice = function (resType){
            // let data = price.list.filter(e=>e._id==resType).head();
            let data = price[resType];
            if(resType == "G") return getPrice("L")+getPrice("U")+getPrice("O")+getPrice("K") // g默认用原矿
            if(BASE_DEPOSITS.includes(resType))return DEFAULT_DEPO_PRICE;
            return data
        };
        let getAllPrice = function (resMap){
            return _.sum(_.keys(resMap).map(e=>getPrice(e)*resMap[e]))
        }
        let getResCnt = function (resType,cnt,resMap){
            let amount = COMMODITIES[resType].amount
            for(let base in COMMODITIES[resType].components){
                let t = COMMODITIES[resType].components[base]*cnt/amount
                if(COMMODITIES[base]&&!COMPRESSION_SET.has(resType)){
                    getResCnt(base,t,resMap)
                }else{
                    resMap[base]=(resMap[base]||0)+t
                    // log(base,t)
                }
            }
            if(COMMODITIES[resType].level){
                let base = "ops"
                let batch = Math.ceil(1000/COMMODITIES[resType].cooldown)// 每1000 tick 能反应几次
                let amount = COMMODITIES[resType].amount
                resMap[base]=(resMap[base]||0)+(100/batch)/amount
            }
            return resMap
        };
        pro._depoNeedPerCommodity = {};
        pro._depoCostPerCommodity = {};
        [BLUE,BROWN,PURPLE,GREEN].forEach(e=>{
            e.forEach(sellDepo=>{
                let mp = {}// 单个资源需要多少
                let basePrice = getAllPrice(getResCnt(sellDepo,1,mp)) // 基础价格
                // let sellDepoPrice = getPrice(sellDepo)
                let depo = _.keys(mp).filter(e=>BASE_DEPOSITS.includes(e)).head()
                // let sellPrice = ((basePrice/mp[depo])+100)*mp[depo]
                // (sellDepoPrice - basePrice)/mp[depo]
                // let opsPerDepo = mp["ops"]/mp[depo]
                // sellPrice
                // opsPerDepo

                // console.log(sellDepo,mp[depo],basePrice,basePrice/mp[depo])//,basePrice/sellDepoPrice
                // log(mp)
                pro._depoNeedPerCommodity[sellDepo] = mp[depo];
                pro._depoCostPerCommodity[sellDepo] = basePrice/mp[depo];
            });
            // console.log()
        })

    }
}

pro.updatePrice()
global.StrategyMarketPrice=pro;