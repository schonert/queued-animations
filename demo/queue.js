var Queue = function(){
	var _this = this;

	// Queued elements
	this.queue = [];

	// all elements
	this.elements = [];

	// Custom groups
	this.group = {};

	// i - used for iteration
	this.current = 0;

	// amount of elements animating 
	this.runningCount = 0;

	// if true attributes are not removed
	this.debug = false;

	// Relevant attributes for the dataset
	this.attributes = [
		// Default
		'queue',
		// The position in the queue/group. example: [data-queue-position="3"] means it will run as the third element.
		// Are there more elements with [data-queue-position="3"] they will all run
		// Syntax: 	[data-queue-position="1"] = position: 1
		//			[data-queue-position="raf"] = group: raf, position: 0
		// 			[data-queue-position="raf:3"] = group: raf, position: 3
		'queue-position',
		// The name of the class/function
		// If there is no function with the animation name, it will assume it's a class
		'queue-animation',
		// Pass on properties to the animation
		'queue-property',
		];

	this.prefix = {}; // Prefix object

	/*
		Queries all elements, extracts queue details and stores them.
		Then runs the queue
	 */ 
	this.init = function(){
		this.elements = document.querySelectorAll('[data-queue]');

		for (var i = 0; i < this.elements.length; i++) {
			var element = this.elements[i],
				elObj = this.buildElement(element);	// Build up queue element

			// Append element to queue 
			this.addToQueue(elObj);	
			this.addToGroups(elObj);
			this.cleanAttributes(element);
		};

		setPrefix();
		this.run();
	};

	/*
		Stores all queue information in an object
	 */
	this.buildElement = function(el){
		
		// Extracts all relevant attributes
		var dataset = this.getDataset(el);
		
		// Splits animations attached to the element
		var animations = dataset.queueAnimation.replace(/\s+/g, '').split(',');
		
		// Checks rather or not queue position is defined or not
		var positions = '' !== dataset.queuePosition ? dataset.queuePosition.replace(/\s+/g, '').split(',') : dataset.queue.replace(/\s+/g, '').split(',');

		// Gets properties
		var properties = dataset.queueProperty.split(';');

		// Queue element
		// Contains:
		// node: DOM element
		// position: xy offsets
		// dimentions: current dimentions
		// queue: main queue position
		// groups: group position
		var	element = {
				node: el,
				position: {
					x: el.offsetLeft,
					y: el.offsetTop
				},
				dimentions: {
					height: el.clientHeight,
					width: el.clientWidth
				},
				queue: [],
				groups: {}
			};

		// Iterations
		var	count = Math.max(animations.length, positions.length);

		for (var i = 0; i < count; i++) {

			// Position, fallback to 0
			var position = undefined !== positions[i] ? positions[i].split(':') : [0];

			// Property as json or string
			var property = IsJsonString(properties[i]) ? JSON.parse(properties[i]) : properties[i];

			// queue details
			var tempQueue = {
					animation: animations[i] || 'animate',
					property: property || {}
				};

			// group name|position|[animation]
			if(position.length >= 2 && isNaN(position[0])){
				var grp = position[0],
					key = !!position[1] ? position[1] : 0;

				if(position.length === 3){
					tempQueue.animation = position[2];
				}

				this.addGroup(grp, element.groups);
				this.addTo(element.groups[grp], key, tempQueue);
			}
			// position|animation
			else if(position.length === 2){
				var key = !!position[0] ? position[0] : 0;
				tempQueue.animation = position[1];

				this.addTo(element.queue, key, tempQueue);
			}
			// position
			else{
				var key = !!position[0] ? position[0] : 0;
				this.addTo(element.queue, key, tempQueue);
			}
		};

		if(dataset.queueProperty)
			element.property = dataset.queueProperty;

		return element;
	}
	
	/*
		Get data attribute
	 */ 
	this.getData = function(el, data){
		return el.getAttribute('data-' + data);
	};

	/*
		Collect all relative data atributes
	 */
	this.getDataset = function(el){
		var properties = this.attributes,
			dataset = {};

		for (var i = 0; i < properties.length; i++) {
			var property = properties[i],
				value = this.getData(el, property) || '',
				key = toCamelCase(property);
			dataset[key] = value;
		};

		return dataset;
	};

	/*
		Removes all queue related attributes from a DOM element.
		If debug is true, no attributes are removed
	 */ 
	this.cleanAttributes = function(el){
		
		if(this.debug) return;

		var properties = this.attributes;
		for (var i = 0; i < properties.length; i++) {
			el.removeAttribute('data-' + properties[i]);
		};
	}

	/*
		Appends the element object to a given object.
		If theres allready an element at the given key,
		the key value is converted to an array, containing both
	 */
	this.addTo = function(obj, key, val){
		
		// No element at the key
		if(undefined === obj[key]){
			obj[key] = val;
		}
		// Key contains an array
		else if(Array.isArray(obj[key])){
			obj[key].push(val);
		}
		// Converte key to array
		else if('[object Object]' === Object.prototype.toString(obj[key])){
			var temp = obj[key];
			obj[key] = [
				temp,
				val
			];
		}
	};

	/*
		Append element to queue
	 */ 
	this.addToQueue = function(elObj){
		for (var key in elObj.queue) {
			var element = {
				node: elObj.node,
				dimentions: elObj.dimentions,
				position: elObj.position,
				animation: elObj.queue[key].animation,
				property: elObj.queue[key].property,
			}

			// Append to queue
			this.addTo(this.queue, key, element);
		};
	};

	/*
		Append element to group
	 */ 
	this.addToGroups = function(elObj){
		for(var name in elObj.groups){
			var group = elObj.groups[name];

			// Create group
			this.addGroup(name);

			for (var key in group) {
				var element = {
					node: elObj.node,
					dimentions: elObj.dimentions,
					position: elObj.position,
					animation: group[key].animation,
					property: group[key].property,
				}

				// append to group
				this.addTo(this.group[name], key, element);
			};
		}
	};

	/*
		Adds a group to the global group object
	 */
	this.addGroup = function(grp, obj){
		obj = obj || this.group;

		if(!obj[grp]){
			obj[grp] = [];
		}
	};

	/*
		Flatterns all arrays in an object
	 */
	this.flattenElements = function(obj){
		var flatten = [];

		// Flattern array
		var flat = function(a){
			
			if(Array.isArray(a)){ // Flattern array
				a.map(function(e){flat(e);});

			}else if('[object Object]' === Object.prototype.toString(a)){ // Store object
				flatten.push(a);
			}
		}

		flat(obj);
		
		return flatten;
	}

	/*
		Gets all elements from a given group.
		All nested arrays are flattend into one array
	 */
	this.getGroupElements = function(grp){
		var group = this.group[grp];

		if(undefined === typeof group){
			return [];
		}

		return this.flattenElements(group);
	};

	/*
		Public run function
	 */ 
	this.run = function(grp){
		run(grp);
	};

	/*
		Filter through queue or group
	 */ 
	this.filter = function(grp, fn){
		var queue = this.group[grp] || this.queue;

		// remove empty cells
		queue = queue.filter(function(e){return e});

		// Iterate over queue
		for (var i = 0; i < queue.length; i++) {
			var elements = queue[i]

			if(!Array.isArray(elements)){
				elements = [elements];
			}

			// Iterate over elements
			for (var j = 0; j < elements.length; j++) {
				element = elements[j];
				fn(element);
			};
		};
	}

	// Run through
	run = function(grp){
		var queue = this.group[grp] || this.queue,
			current = 0, // Current iteration in the current group
			runningCount = 0; // Amount of animations waiting to finish

		// no queue found
		if(queue == window){
			return;
		}

		// remove empty cells
		queue = queue.filter(function(e){return e});

		// Run next iteration
		var next = function(){
			var elements = queue[current];

			if(!elements){
				current++;
			}
			
			// If single element, create array
			if(!Array.isArray(elements)){
				elements = [elements];
			}

			runningCount = elements.length;


			// Elements iteration
			for (var i = 0; i < elements.length; i++) {
				var element = elements[i];

				// If for some reason does not contain an animation - continue
				if(!element || !element.hasOwnProperty('animation')){
					runningCount--;
					continue;
				}

				// remove 'done' classes
				if(element['animation'] === 'animate'){
					element.node.classList.remove('queue-' + element['animation'] + '-done');
				}else{
					element.node.classList.remove(element['animation'] + '-done');
				}

				// run animation function
				if('function' === typeof window[element.animation]){
					window[element.animation](element, complete);
				}
				// Add animation class
				else{
					if(element['animation'] === 'animate'){
						addClass(element.node, 'queue-' + element['animation']);
					}else{
						addClass(element.node, element['animation']);
					}

					if(hasDuration(element.node)){
						// Wait until animation is finish, to complete
						prefixEvent(element.node, 'TransitionEnd', complete.bind(undefined, element));
						prefixEvent(element.node, 'AnimationEnd', complete.bind(undefined, element));
					}else{
						console.log('run')
						complete(element)
					}

				}

			};
		};

		// On completion
		var complete = function(el){
			runningCount--;

			// Check if 'animation'-done is a function
			if('function' === typeof window[el.animation + '-done']){
				window[el.animation + '-done'](el, complete);
			}
			// Append 'animation'-done class
			else{
				if(el['animation'] === 'animate'){
					addClass(el.node, 'queue-' + el['animation'] + '-done');
				}else{
					addClass(el.node, el['animation'] + '-done');
				}
			}
			
			// Last animation?
			if(runningCount !== 0)
				return;

			// reset
			runningCount = 0;

			// Next iteration
			current++;
			next();
		};

		next();
	}

	// Convert string to camelcase
	var toCamelCase = function(string) { 
		return string.toLowerCase().replace(/-(.)/g, function(match, group) {
			return group.toUpperCase();
		});
	}

	// JavaScript hasClass, addClass, removeClass
	//source: http://www.avoid.org/?p=78
	var hasClass = function(el, name) {
		return new RegExp('(\\s|^)'+name+'(\\s|$)').test(el.className);
	}

	var addClass = function(el, name){
		if (!hasClass(el, name)) { el.className += (el.className ? ' ' : '') +name; }
	}

	var removeClass = function(el, name){
		if (hasClass(el, name)) {
			el.className=el.className.replace(new RegExp('(\\s|^)'+name+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, '');
		}
	}

	// prefixer
	// Good old Walsh to the rescue
	// http://davidwalsh.name/vendor-prefix
	var setPrefix = function () {
		var styles = window.getComputedStyle(document.documentElement, ''),
			pre = (Array.prototype.slice
				.call(styles)
				.join('') 
				.match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
			)[1],
			dom = ('WebKit|Moz|MS|O').match(new RegExp('(' + pre + ')', 'i'))[1];
		this.prefix = {
			dom: dom,
			lowercase: pre,
			css: '-' + pre + '-',
			js: pre[0].toUpperCase() + pre.substr(1)
		};
	};

	// Prefixs transition/animation events
	var prefixEvent = function (el, event, fn) {
		var pfx = ["webkit", "moz", "MS", "o", ""];
		for (var p = 0; p < pfx.length; p++) {
			if (!pfx[p]) event = event.toLowerCase();
			el.addEventListener(pfx[p]+event, fn, false);
		}
	};

	// Checks rather an element has a animation/transition duration
	var hasDuration = function(element){
		var transition = element.style['transition'] || element.style[prefix['js'] + 'Transition'],
			animation = element.style['animation'] || element.style[prefix['js'] + 'Animation'];

		if(!!transition || !!animation){
			return true;
		}else{
			var styles = getComputedStyle(element);
			transition = styles['transition'];
			animation = styles['animation'];

			return !!transition || !!animation;
		}
	}

	// Checks rather string is json
	function IsJsonString(str) {
		try {JSON.parse(str);} 
		catch (e) {return false;}
		return true;
	}


	this.init.apply(this, arguments);

	// run 
	return this;
};