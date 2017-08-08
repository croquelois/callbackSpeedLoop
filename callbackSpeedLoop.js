(function(){
  "use strict";
  
  function callbackSpeedLoop(iter, maxDepth, finished){
    let channel = new MessageChannel();
    let currentDepth = 0;
    function loop(){
      iter(function(err, isFinished){
        if(err || isFinished){
          channel.port2.onmessage = null;
          return finished(err);
        }
        if(currentDepth++ > maxDepth){
          currentDepth = 0;
          channel.port1.postMessage("");
        }else return loop();
      });
    }
    channel.port2.onmessage = loop;
    channel.port1.postMessage("");
  }
  
  let nInit = 50000;
  let n = nInit;
  let t0 = (new Date()).getTime();
  
  callbackSpeedLoop(function(cb){
    return cb(null, !(n--));
  },200,function(){
    let dt = (new Date()).getTime() - t0;
    console.log(dt,dt/nInit);
  });  
  
})();

(function(){
  "use strict";
  
  function callbackLoop(iter, finished){
    function loop(){
      iter(function(err, isFinished){
        if(err || isFinished)
          return finished(err);
        return loop();
      });
    }
    loop();
  }
  
  let nInit = 50000;
  let n = nInit;
  let t0 = (new Date()).getTime();
  
  callbackLoop(function(cb){
    return cb(null, !(n--));
  },function(){
    let dt = (new Date()).getTime() - t0;
    console.log(dt,dt/nInit);
  });  
  
})();


(function(){
  "use strict";
  
  function callbackSlowLoop(iter, finished){
    function loop(){
      iter(function(err, isFinished){
        if(err || isFinished)
          return finished(err);
        setTimeout(loop,0);
      });
    }
    loop();
  }
  
  let nInit = 50000;
  let n = nInit;
  let t0 = (new Date()).getTime();
  
  callbackSlowLoop(function(cb){
    return cb(null, !(n--));
  },function(){
    let dt = (new Date()).getTime() - t0;
    console.log(dt,dt/nInit);
  });  
  
})();