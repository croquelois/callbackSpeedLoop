# callbackSpeedLoop

if you need to do a loop with a function that use a callback, it can be tricky. You could do something like 

```js

function loop(){
  iter(function(err, isFinished){
    if(err || isFinished)
      return finished(err);
    return loop();
  });
}
loop();

```

and it SHOULD be fine because tail call optimisation is in the standard. But few care about this part of the standard, the good guys of Webkit/Safari have done their job, but no one else yet (august 2017)

So, because our stack is limited, we'll quickly run out of space. in Chrome I can do roughly 10000 iteration before to throw "Maximum call stack size exceeded".

We need to get rid of our stack and start again with a brand new one. To do so perhaps we can use setTimeout ?

```js

function loop(){
  iter(function(err, isFinished){
    if(err || isFinished)
      return finished(err);
    setTimeout(loop,0);
  });
}
loop();

```

If you test that with a few iteration you will quickly understand the pain... there is a lag of 4ms each time you call setTimeout (that's defined in the standard). So 50000 iterations should be at least 200s ! (it take 4 min on my computer)

Don't worry, I've got a solution for you. Messaging allow you also to get rid of the stack, and doesn't suffer of the 4ms penalty. so we can use Channel object to create a quick callback loop. But that's not enough for me, so I mix it with a bit of direct call. 

```js

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
  
```

With this solution I do 50000 iteration in 6ms (maxDepth at 200). maxDepth need to be fine tuned, but even at 0, I run the 50000 iteration in 102ms

check the js file for the examples
