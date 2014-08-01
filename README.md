Queued animations (5kb minified)
========
This little library is when you are in need of queue a bunch og animations to a bunch of element. I've attempted to make it as lightweight and flexible as posible (ye you know.. regular sales pitch stuff).

## Animations
There's a ton of different ways of animating elements. In some cases a simple CSS **transition**/**animation** will be more then enough, but in other cases a more complicated aproach is required wich calls for **JavaScript**. Either way you should have the flexibilty to add and modify these queued animations as required.

###Here's an example my friend

#### CSS animations
```html
<style>
div{
	opacity: 0;
	background: red;
	transition: 3s;
}
/* Default if no animation is assigned */
.queue-animation{
	opacity: 1;
}
.scaleUp{
	animation: scaleUp 3s;
}
</style>

<div data-queue>
	I'll fade in first!
</div>

<div data-queue 
	 data-queue-position="1"
	 data-queue-animation="scaleUp">
	Let me just wait until the first elements are done animating
</div>
```
#### JavaScript animations
```html
<div data-queue 
	 data-queue-position="groupName"
	 data-queue-animation="changeBG">
	I'll just wait until my group is run...

	<div data-queue
		 data-queue-position="groupName:3" 
		 data-queue-animation="changeBG">
		I'm the third in my group
	</div>
</div>

<script>
	var queue = Queue();
	document.getElementById('trigger-favorite-group').addEventListener('click', function(){
		queue.run('groupName');
	});

	// Animation function 'changeBG'
	function changeBG (queueObject, complete) {
		var element = queueObject.node;

		element.style.background = "tomato";

		// Continue with the queue
		complete(queueObject);
	}
</script>
```
The above is a samll example of how to animate using **transitions**, **animations** and **JavaScript**.

## Queue
Being able to animate is only a small part of chaining animations together. Some elemement may require multiple queue positions, multiple groups and even multiple animations. Groups should be as easy to manipulate. What good is a bunch of elements, if you can't manipulate them in an easy manner.

> The queue will start at position 0
<br>
> If there is no elements between two queue positions (1,2,3,99), the queue will simply just jump to the next element

### Adding to the queue
#### Multiple positions
```html
<div data-queue 
	 data-queue-position="1,10,50">
	I'm number 1, 10 and 50! Rock ON!
</div>
```
#### Multiple positions, different animations
```html
<div data-queue 
	 data-queue-position="1:changeColor,1:scaleUp,5:scaleDown">
	'changeColor' and 'scaleUp' will get triggered at the same time, while 'scaleDown' will be the 6th
</div>
```
#### Multiple positions, groups and animations
```html
<div data-queue
	 data-queue-position="raf:rafAnimation,pageLoad:5,pageLoad:6:scale">
	I'll be added to the 'raf' and 'pageLoad' group.
	When the 'raf' group is run I'll use the 'rafAnimation' animation! 
	Besides that I'll run twice through the pageLoad, 
	once with the default animation and once with the 'scale' animation!
</div>

<script>
	var queue = Queue();

	// Run group: pageLoad onload
	window.onload = function(){
		queue.run('pageLoad');
	}

	// Run group: raf after 2sec
	setTimeout(function(){
		queue.run('raf')
	}, 2000);

	// 'rafAnimation' function. is run once per element
	function rafAnimation(object, complete){
		var element = object.node,
			opacity = 0;

		(function run(){
			opacity = element.style.opacity = opacity + 0.1;

			if(opacity > 1){
				complete(object); // Tells the queue to continue
				return;
			}

			requestAnimationFrame(run);
		})();
	}
	
</script>
```
### Properties
The last thing I'll mention is **properties**. Being able to pass along with an animation function will give you a huge advantage with complex animations and will allow you to build a DRY setup. Having a fadeIn JavaScript animation function and passing the duration as a property eleminates the need to create a new animation function per duration.

> Property values are seperated with ``;``, instead of ``,``. This is due to the fact that JSON requires ``,``.

#### Animation function with properties
```html
<div data-queue
	 data-queue-animation="fade" 
	 data-queue-property="1000">
	I'll fade in over the duration of 1 sec
</div>

<div data-queue
	 data-queue-position="1:fade" 
	 data-queue-property="-3000">
	I'll fade out, after the first div, over the duration of 3 sec
</div>

<script>
	var queue = Queue();

	// Animation function 'fade'
	// duration: 400 -> fadeIn over 400ms
	// duration: -1000 -> fadeOut over 1000ms
	function fade(object, complete){
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
</script>
```
#### Animation function with JSON property
```html
<div data-queue 
	 data-queue-position="introduce:0:alertAnimation" 
	 data-queue-property='{"value":"My name is El Stefano!", "callback":"askForName"}'>
	I'll fade in over the duration of 1 sec
</div>

<script>
	var queue = Queue();

	document.getElementById('introduce').addEventListener('click', function(){
		queue.run('introduce');
	});

	function alertAnimation(object, complete){
		var element = object.node,
			value = object.property.value,
			callback = object.property.callback;

		alert(value);

		window[callback]();

		// Continue with the queue
		complete(object);
	}

	function askForName(){
		var name = prompt("What's your name old chap?");
	}
</script>
```
#### Multiple animations with properties
```html
<div data-queue 
	 data-queue-position="3:firstAnimation, 10:secondAnimation, 5:thirdAnimation" 
	 data-queue-property='firstValue; secondValue; {"name": "thirdValue"}'>
	My properties are maped to my position! The first position in the attribute will match 
	the first property in the property-attribute.
</div>
```

### Demo
There's a small demo in the demo folder. Go check it out homebro!


### There we go
That was all for now. I hope You've got an impression of what and what not to expect of this little tool. You will, without doubt have a question or two along the way. Feel free to contact med over twitter, mail, facebook, postage service, pidgens, in person or even give me call. This goes with out saying, you can contact me either It's relevent to the tool or not.

Bird<br> 
@schonert

F<br>
stefan.schonert

Interweb<br>
sh[at]schonert[dot]dk