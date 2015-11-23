// jshint ignore: start
// jscs:disable

/**
 * Polyfills for IE8 and under
 * code taken from https://developer.mozilla.org/ is dedicated to the Public Domain:
 * https://developer.mozilla.org/en-US/docs/MDN/About#Copyrights_and_licenses
 */

/**
 * basic JSON polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON
 */
if (!window.JSON) {
	window.JSON = {
		parse: function( sJSON ) { return eval( '(' + sJSON + ')' ); },
		stringify: ( function () {
			var toString = Object.prototype.toString;
			var isArray = Array.isArray || function ( a ) { return toString.call (a ) === '[object Array]'; };
			var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
			var escFunc = function ( m ) { return escMap[ m ] || '\\u' + ( m.charCodeAt( 0 ) + 0x10000 ).toString( 16 ).substr( 1 ); };
			var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
			return function stringify( value ) {
				if ( value == null ) {
					return 'null';
				} else if ( typeof value === 'number' ) {
					return isFinite( value ) ? value.toString() : 'null';
				} else if ( typeof value === 'boolean' ) {
					return value.toString();
				} else if ( typeof value === 'object' ) {
					if ( typeof value.toJSON === 'function' ) {
						return stringify( value.toJSON() );
					} else if ( isArray( value ) ) {
						var res = '[';
						for ( var i = 0; i < value.length; i++ )
							res += ( i ? ', ' : '') + stringify( value[ i ] );
						return res + ']';
					} else if ( toString.call( value ) === '[object Object]' ) {
						var tmp = [];
						for ( var k in value ) {
							if ( value.hasOwnProperty( k ) )
								tmp.push( stringify( k ) + ': ' + stringify( value[ k ] ) );
						}
						return '{' + tmp.join( ', ' ) + '}';
					}
				}
				return '"' + value.toString().replace( escRE, escFunc ) + '"';
			};
		})()
	};
}

/**
 * Array.indexOf polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Compatibility
 */

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function(searchElement, fromIndex) {

		var k;

		if (this == null) {
			throw new TypeError('"this" is null or not defined');
		}

		var O = Object(this);

		var len = O.length >>> 0;

		if (len === 0) {
			return -1;
		}

		var n = +fromIndex || 0;

		if (Math.abs(n) === Infinity) {
			n = 0;
		}

		if (n >= len) {
			return -1;
		}

		k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

		while (k < len) {
			if (k in O && O[k] === searchElement) {
				return k;
			}
			k++;
		}
		return -1;
	};
}

/**
 * Document.querySelectorAll polyfill
 * https://gist.github.com/chrisjlee/8960575
 */
if (!document.querySelectorAll) {
	document.querySelectorAll = function (selectors) {
		var style = document.createElement('style'), elements = [], element;
		document.documentElement.firstChild.appendChild(style);
		document._qsa = [];

		style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
		window.scrollBy(0, 0);
		style.parentNode.removeChild(style);

		while (document._qsa.length) {
			element = document._qsa.shift();
			element.style.removeAttribute('x-qsa');
			elements.push(element);
		}
		document._qsa = null;
		return elements;
	};
}

if (!document.querySelector) {
	document.querySelector = function (selectors) {
		var elements = document.querySelectorAll(selectors);
		return (elements.length) ? elements[0] : null;
	};
}

/**
 * Object.bind polyfill
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 */
if (!Function.prototype.bind) {
	Function.prototype.bind = function(oThis) {
		if (typeof this !== 'function') {
			// closest thing possible to the ECMAScript 5
			// internal IsCallable function
			throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
		}

		var aArgs   = Array.prototype.slice.call(arguments, 1),
			fToBind = this,
			fNOP    = function() {},
			fBound  = function() {
				return fToBind.apply(this instanceof fNOP
						? this
						: oThis,
					aArgs.concat(Array.prototype.slice.call(arguments)));
			};

		if (this.prototype) {
			// native functions don't have a prototype
			fNOP.prototype = this.prototype;
		}
		fBound.prototype = new fNOP();

		return fBound;
	};
}


/**
 * Element.matches polyfill
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
 */
if ( window.Element && !Element.prototype.matches ) {

	Element.prototype.matches = function matches( selector ) {
		var matches = ( this.document || this.ownerDocument ).querySelectorAll( selector ),
		i = matches.length;
		while ( --i >= 0 && matches.item(i) !== this ) ;
		return i > -1;
	};
}

var attachedEvents = [];

function addEvent( obj, evt, fn ) {

	if ( !obj ) {
		return;
	}

	if ( obj.addEventListener ) {
		obj.addEventListener( evt, fn, false );
	} else if ( obj.attachEvent ) {
		attachedEvents.push( [ obj, evt, fn ] );
		obj.attachEvent( 'on' + evt, fn );
	}
}

function removeEvent( obj, evt, fn ) {

	if ( !obj ) {
		return;
	}

	if ( obj.removeEventListener ) {
		obj.removeEventListener( evt, fn );
	} else if ( obj.detachEvent ) {
		obj.detachEvent( 'on' + evt, fn );
	}
}

/**
 * Queues the given function to be called once the DOM has finished loading.
 *
 * Based on jquery/src/core/ready.js@825ac37 (MIT licensed)
 */
function doWhenReady( fn ) {
	var ready = function () {
		removeEvent( document, 'DOMContentLoaded', ready );
		removeEvent( window, 'load', ready );
		fn();
	};

	if ( document.readyState === 'complete' ) {
		// Already ready, so call the function synchronously.
		fn();
	} else {
		// Wait until the DOM or whole page loads, whichever comes first.
		addEvent( document, 'DOMContentLoaded', ready );
		addEvent( window, 'load', ready );
	}
}

/**
 * Removes all event handlers in Internet Explorer 8 and below.
 *
 * Any attached event handlers are stored in memory until IE exits, leaking
 * every time you leave (or reload) the page. This method cleans up any
 * event handlers that remain at the time the page is unloaded.
 */
window.onunload = function () {
	var i, evt;
	for ( i = 0; i < attachedEvents.length; i++ ) {
		evt = attachedEvents[ i ];
		if ( evt[ 0 ] ) {
			evt[ 0 ].detachEvent( 'on' + evt[ 1 ], evt[ 2 ] );
		}
	}
	attachedEvents = [];
};

