/*

// harras
        stealAtNight();
        let asdpofFac = Game.getObjectById('60729a4075407b3bab8b6307');
        if (asdpofFac) {
            if (_.sum(asdpofFac.store)>40000) {
                Memory.asdpofTimer = 117;
            }
            else if (_.sum(asdpofFac.store)>25000) {
                Memory.asdpofTimer = 277;
            }
            else if (_.sum(asdpofFac.store)>15000) {
                Memory.asdpofTimer = 1377;
            }
            else if (_.sum(asdpofFac.store)>5000) {
                Memory.asdpofTimer = 2377;
            }
        }
        let asdpofTimer = Memory.asdpofTimer;
        if (!asdpofTimer) {
            Memory.asdpofTimer = 377;
            asdpofTimer = 377;
        }
        
        if (Game.time%asdpofTimer==0) {
            //thisIsWhatYouWanted();
            //annoyerSpawner('E19S19', 'E21S16')
            //symbolAsdpofSpawner('E19S19', 'E21S11');
        }
        
        if (Game.time%1300==0) {
            //kiterSpawner('E24S27', 'E25S27', 6);
            //kiterSpawner('E24S27', 'E26S27', 6);
            //kiterSpawner('E24S27', 'E26S28', 6);
            //kiterSpawner('E24S27', 'E26S29', 6);
        }
        
        /*
        if (Game.time%1500==0) {
            traderSpawner('E11S16', 'E11S18');
        }
        if (Game.time%1500==500) {
            traderSpawner('E11S16', 'E12S12');
        }
        if (Game.time%1500==1000) {
            traderSpawner('E11S16', 'E15S13')
        }
        */
        
        if (Game.time%1250==0 && !Memory.rooms['E25S16'].avoid) {
            Game.rooms.E23S16.memory.forSpawning.spawningQueue.push({memory:{role: 'keeperLairMeleeKeeper', target: 'E25S16', home: 'E23S16', ranged: false}, priority: 5});
        }
        
        if (Game.time%717==277) { // pioneer
            //Game.rooms['E5S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'reserver', target: 'E7S22', big: true, roomEnergyMax: 2000},priority: 6});
            //Game.rooms['E5S21'].memory.forSpawning.spawningQueue.push({memory:{energy: 1900, role: 'pioneer', target: 'E7S22', home: 'E5S21', superUpgrader: false},priority: 20});
        }
        if (Game.time%163==7) { // pioneer
            //sendSacrificer('E19S19', 'E23S16')
            //sendSacrificer('E19S19', 'E11S17')
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{energy: 900, role: 'pioneer', target: 'E22S11', home: 'E19S21', superUpgrader: false},priority: 10});
        }
        
        if (Game.time%10==0) {
            if (Game.cpu.bucket>9300) {
                if (Game.rooms.E9S22.memory.hasFreeSpawnCapa == true) {
                    sendSeason2c('E9S22', 'E12S25', 'symbol_ayin', 1, 0, 25);
                    sendSeason2c('E9S22', 'E12S26', 'symbol_zayin', 1, 0, 25);
                    sendSeason2c('E9S22', 'E14S21', 'symbol_kaph', 1, 0, 25);
                    sendSeason2c('E9S22', 'E12S22', 'symbol_res', 1, 0, 25);
                    Game.rooms.E9S22.memory.hasFreeSpawnCapa = false;
                }
                sendSeason2c('E7S28', 'E9S28', 'symbol_taw', 1, 0, 25);
                sendSeason2c('E7S28', 'E4S29', 'symbol_teth', 1, 0, 25);
                sendSeason2c('E4S23', 'E1S21', 'symbol_qoph', 1, 0, 25);
            }
            if (Game.cpu.bucket>9100) {
                if (Game.rooms.E19S21.memory.hasFreeSpawnCapa == true) {
                    sendSeason2c('E19S21', 'E18S28', 'symbol_yodh', 1, 0, 25);
                    sendSeason2c('E19S21', 'E17S24', 'symbol_aleph', 1, 0, 25);
                    sendSeason2cnew('E19S21', 'E21S25', 'symbol_sim', 1, 0, 25);
                    sendSeason2cnew('E19S21', 'E22S29', 'symbol_gimmel', 1, 0, 25);
                    Game.rooms.E19S21.memory.hasFreeSpawnCapa = false;
                }
                if (Game.rooms.E1S27.memory.hasFreeSpawnCapa == true) {
                    sendSeason2c('E1S27', 'E3S26', 'symbol_he', 1, 0, 25);
                    sendSeason2c('E1S27', 'E1S24', 'symbol_daleth', 1, 0, 25);
                    Game.rooms.E1S27.memory.hasFreeSpawnCapa = false;
                }
                if (Game.rooms.E19S19.memory.hasFreeSpawnCapa == true) {
                    sendSeason2cnew('E19S19', 'E23S21', 'symbol_mem', 1, 0, 25);
                    Game.rooms.E19S19.memory.hasFreeSpawnCapa = false;
                }
            }
            if (Game.cpu.bucket>9000) {
                if (Game.rooms.E24S27.memory.hasFreeSpawnCapa == true) {
                    sendSeason2cnew('E24S27', 'E28S24', 'symbol_tsade', 1, 0, 25);
                    sendSeason2cnew('E24S27', 'E25S29', 'symbol_samekh', 1, 0, 25);
                    Game.rooms.E24S27.memory.hasFreeSpawnCapa = false;
                }
            }
        }
        
        if (Game.time%1000==666) {
            //sendSeason2cPirate('E19S21', 'E21S25', 'symbol_sim', 1, 0);
        }
        
        if (Game.time%3333==0) { // tunneller // 1321s best for digging
            //Game.rooms['E7S28'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E10S22', boostMats: false, tarId: ['602c72a062f1b63ed41e47a2']},priority: 15});
            //Game.rooms['E7S28'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E10S22', boostMats: 'ZH', tarId: ['602c72a062f1b63ed41e4839', '602c72a062f1b63ed41e486a']},priority: 15});
        }
        
        if (Game.time%933==0) { // digger
            //Game.rooms['E9S22'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['ZH'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
        }
        
        /*
        if (Game.rooms.E1S30&&Game.getObjectById('602c729a62f1b63ed41d957e')==undefined) {
            
        }
        if (Memory.dz) {
            // pass
        }
        else {
            if (Game.time%1387==0) { // digger
                Game.rooms['E1S27'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E1S30', boostMats: ['XZHO2', 'XZH2O'], tarId: ['602c729a62f1b63ed41d957f', '602c729a62f1b63ed41d9585', '602c729a62f1b63ed41d9586', '602c729a62f1b63ed41d9582', '602c729a62f1b63ed41d957e']},priority: 15});
            }
        }
        */
        
        if (Game.time%1106==0) { // digger
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['ZH', 'ZO'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: [true], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
            //Game.rooms['E9S22'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E10S20', boostMats: ['XZHO2', 'XZH2O'], tarId: ['602c72a062f1b63ed41e462e', '602c72a062f1b63ed41e460a', '602c72a062f1b63ed41e45d8', '602c72a062f1b63ed41e45a6']},priority: 15});
            //Game.rooms['E9S22'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E10S16', boostMats: ['XZHO2'], tarId: ['602c72a062f1b63ed41e40c5', '602c72a062f1b63ed41e40f7', '602c72a062f1b63ed41e4129', '602c72a062f1b63ed41e415c', '602c72a062f1b63ed41e418a', '602c72a062f1b63ed41e4196']},priority: 15});
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['ZO'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['ZH2O'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
            //Game.rooms['E19S21'].memory.forSpawning.spawningQueue.push({memory:{role: 'dismantler', target: 'E20S20', boostMats: ['XZH2O'], tarId: ['602c72a762f1b63ed41f1e20', '602c72a762f1b63ed41f1e51', '602c72a762f1b63ed41f1e82', '602c72a762f1b63ed41f1eb3', '602c72a762f1b63ed41f1ee4']},priority: 15});
        }
        if (Game.time % 1446 == 1) { // stealer for dismanted wall
            //Game.rooms['E11S16'].memory.forSpawning.spawningQueue.push({memory:{role: 'stealer', home: 'E11S16', target: 'E10S16'}, priority: 13.5});
            //symbolStealerSpawner('E9S22', 'E7S19')
        }
        
*/