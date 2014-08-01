var queue = Queue();

// Delay demo-group from running
setTimeout(function(){
	queue.run('demo-group');
}, 2000)

// Animation 'demo'
function demo(object, complete){
	var element = object.node;

	element.style.opacity = 1;

	// complete animation
	complete(object)
}

// trigger raf-group
document.getElementById('trigger-raf').addEventListener('click', function(){
	// reset opacity
	queue.filter('raf-group', function(object){
		object.node.style.opacity = 0;
	});

	// Run group queue
	queue.run('raf-group')
});

// Animation 'raf'
function raf(object, complete){
	var element = object.node,
		duration = !isNaN(object.property) ? object.property : 200,
		start = Date.now();
		
	(function run(){
		var ratio = (Date.now() - start) / duration;
		
		if(duration > 0){
			element.style.opacity = ratio;
		}else{
			element.style.opacity = 1 + ratio;
		}

		if(Math.abs(ratio) > 1){
			complete(object); // Tells the queue to continue
			return;
		}
		
		requestAnimationFrame(run);
	})();
}


// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 
// MIT license
 
(function(window) {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}(this));