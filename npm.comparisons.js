////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var comparisons = (
	function () {
		var typeOf,
			isEmpty,
			each,
			every,
			some,
			has,
			merge,
			pathToObject,
			mapHandler,
			methods = {};
			
////////////////////////////////////////////////////////////////////////////////
// The genius work of Douglas Crockford
/**
 * A function for getting a more better typeof value than the built-in one
 *
 * @method typeOf
 * @param value {Variable} Any value to be tested
 * @return {String} A string containing the type of the supplied variable
 **/
		methods.typeOf = function ( value ) {
			var s = typeof value;
			if ( s === 'object' ) {
				if ( value ) {
					if ( typeof value.length === 'number' && !( value.propertyIsEnumerable( 'length' ) ) && typeof value.splice === 'function' ) {
						s = 'array';
					}
				} else {
					s = 'null';
				}
			}
			
			return s;
		};

////////////////////////////////////////////////////////////////////////////////
// The genius work of Douglas Crockford
/**
 * A function for testing if a variable is empty
 * 
 * @method isEmpty
 * @param o {Object} Any object to be tested
 * @return {Boolean} True if the object contains enumerable members or False if not
 **/
		methods.isEmpty = function ( o ) {
			var i,
				v;
			if ( methods.typeOf( o ) === 'object' ) {
				for ( i in o ) {
					v = o[i];
					if ( v !== undefined && methods.typeOf( v ) !== 'function' ) {
						return false;
					}
				}
			}
			return true;
		};

		////////////////////////////////////////////////////////////////////////////////
		// 
		
		////////////////////////////////////////////////////////////////////////////////
		// Iterate through an array or object
		methods.each = function ( object, callback, withInherited, withFunctions ) {
			var returnObject = {},
				count = 0,
				key;
			
			for ( key in object ) {
				if ( object.hasOwnProperty( key ) || withInherited ) {
					if ( typeof object[ key ] !== 'function' || ( typeof object[ key ] === 'function' && withFunctions ) ) {
						returnObject[ key ] = callback.call( object, key, object[ key ], count );
						count++;
					}
				}
			}
			
			return returnObject;
		};
			
		////////////////////////////////////////////////////////////////////////////////
		// Iterate through an array or object
		methods.every = function ( object, callback, withInherited, withFunctions ) {
			var returnValue = true,
				count = 0,
				key;
			
			for ( key in object ) {
				if ( object.hasOwnProperty( key ) || withInherited ) {
					if ( typeof object[ key ] !== 'function' || ( typeof object[ key ] === 'function' && withFunctions ) ) {
						returnValue = callback.call( object, key, object[ key ], count );
						
						if ( !returnValue ) {
							return false;
						}
					}
				}
			}
			
			return true;
		};
			
		////////////////////////////////////////////////////////////////////////////////
		// Iterate through an array or object
		methods.some = function ( object, callback, withInherited, withFunctions ) {
			var returnValue = false,
				count = 0,
				key;
			
			for ( key in object ) {
				if ( object.hasOwnProperty( key ) || withInherited ) {
					if ( typeof object[ key ] !== 'function' || ( typeof object[ key ] === 'function' && withFunctions ) ) {
						returnValue = callback.call( object, key, object[ key ], count );
						
						if ( returnValue ) {
							return true;
						}
					}
				}
			}
			
			return false;
		};
		
		////////////////////////////////////////////////////////////////////////////////
		// Check if an object has a property (or array key)
		methods.has = function ( object, string, withInherited, withFunctions ) {
			var key;
					
			for ( key in object ) {
				if ( object.hasOwnProperty( key ) || withInherited ) {
					if ( string instanceof RegExp ) {
						if ( ( typeof object[ key ] !== 'function' || ( typeof object[ key ] !== 'function' && withFunctions ) ) && string.test( key ) ) {
							return true;
						}
					}
					else {
						if ( ( typeof object[ key ] !== 'function' || ( typeof object[ key ] !== 'function' && withFunctions ) ) && key === string ) {
							return true;
						}
					}
				}
			}
		
			return false;
		};
			
		////////////////////////////////////////////////////////////////////////////////
		// Combine objects
		methods.merge = function () {
			var returnObject = {},
				object = {},
				i,
				key,
				deep = false;
			
			var argLen = arguments.length;
			
			if ( argLen > 1 && typeof arguments[ argLen - 1 ] === "boolean" && arguments[ argLen - 1 ] ) {
				deep = true;
			}
			
			returnObject = ( typeof arguments[ 0 ] === "object" ) ? arguments[ 0 ] : returnObject;
			
			for ( i = 1; i < argLen; i++ ) {
				object = arguments[ i ];
				
				if ( object && typeof object === "object" ) {
					for ( key in object ) {
						if ( object.hasOwnProperty( key ) ) {
							if ( deep && ( typeof object[ key ] === "object" ) && ( object[ key ] !== null ) && !( typeof object[ key ] instanceof RegExp ) ) {
								if ( object[ key ] instanceof Array ) {
									returnObject[ key ] = object[ key ].concat();
								}
								else if ( ( returnObject[ key ] !== undefined ) && ( typeof returnObject[ key ] === "object" ) && ( returnObject[ key ] !== null ) && !( returnObject[ key ] instanceof Array ) ) {
									returnObject[ key ] = methods.merge( returnObject[ key ], object[ key ], deep );
								}
								else {
									returnObject[ key ] = methods.merge( {}, object[ key ], deep );
								}
							}
							else {
								returnObject[ key ] = object[ key ];
							}
						}
					}
				}
			}
		
			return returnObject;
		};
		
		////////////////////////////////////////////////////////////////////////////////
		
		methods.makeMap = function () {
			var map = {},
				object,
				skipTrue = false;
			
			object = arguments[ 0 ];
			
			if ( arguments.length > 1 && methods.typeOf( arguments[ arguments.length - 1 ] ) === "boolean" ) {
				skipTrue = arguments[ arguments.length - 1 ];
			}
			
			if ( methods.typeOf( object ) === "array" ) {
				map.$type = "array";
				map.$unid = false;
				map.$sort = false;
				
				object.forEach(
					function ( element ) {
						if ( map.$child === undefined || map.$child === true ) {
							if ( methods.typeOf( element ) === "array" || methods.typeOf( element ) === "object" ) {
								map.$child = methods.makeMap( element, skipTrue );
							}
						}
						else {
							if ( map.$child === undefined && !skipTrue ) {
								map[ key ] = true;
							}
						}
					}
				);
			}
			else if ( methods.typeOf( object ) === "object" ) {
				map.$type = "object";
				
				methods.each(
					object,
					function ( key, value, i ) {
						if ( methods.typeOf( value ) === "array" || methods.typeOf( value ) === "object" ) {
							map[ key ] = methods.makeMap( value, skipTrue );
						}
						else {
							if ( !skipTrue ) {
								map[ key ] = true;
							}
						}
					}
				);
			}
			
			if ( arguments.length > 1 ) {
				
				Array.prototype.slice.call(
					arguments,
					function ( element, i ) {
						if ( i > 0 ) {
							var extraMap = methods.makeMap( element, skipTrue );
							
							if ( extraMap.$type && extraMap.$type === map.$type ) {
								map = methods.merge( extraMap, map );
							}
						}
					}
				);
			}
			
			return map;
		};
		
		////////////////////////////////////////////////////////////////////////////////

		pathToObject = function ( object, path, value ) {
			var current,
				length;
		
			value = ( value === undefined ) ? false : value;
		
			current = object;
		
			path = path.split( "." );
		
			length = path.length;
		
			path.some(
				function ( prop, iter ) {
					if ( ( iter + 1 ) < length ) {
						if ( current[ prop ] !== false && current[ prop ] !== null ) {
							if ( current[ prop ] === undefined ) {
								current[ prop ] = {};
							}
		
							current = current[ prop ];
						}
						else {
							return true;
						}
					}
					else {
						current[ prop ] = value;
		
						return true;
					}
				}
			);
		
			return object;
		};
			
		mapHandler = function ( map ) {
			if ( typeof map === "string" ) {
				map = [ map ];
			}
			
			if ( map instanceof Array ) {
				map = map.reduce(
					function ( result, element, iter ) {
			
						if ( typeof element === "object" ) {
							Object.keys( element ).forEach(
								function ( key ) {
									var value;
			
									value = element[ key ];
			
									result = pathToObject( result, key, value );
								}
							);
						}
						else if ( typeof element === "string" ) {
							result = pathToObject( result, element, false );
						}
			
						return result;
					},
					{}
				);
			}
			
			return map;
		};


		////////////////////////////////////////
		////////////////////////////////////////////////////////////////////////////////
		// 
		// equals
		// Identify if two objects are different
		// 
		// Object A is assumed to be 'new', and Object B is assumed to be 'old'
		// 
		
		methods.equals = function ( objectA, objectB, map ) {
			var result = false,
				keysA,
				keysB,
				keysBDifference,
				keysMap;

			////////////////////////////////////////
			
			map = mapHandler( map );
			
			////////////////////////////////////////
		
			// Check if they are pointing at the same variable. If they are, no need to test further.
			if ( objectA === objectB ) {
				return true;
			}
		
			// Check if they are the same type. If they are not, no need to test further.
			if ( methods.typeOf( objectA ) !== methods.typeOf( objectB ) ) {
				return false;
			}
		
			// Check what kind of variables they are to see what sort of comparison we should make.
			if ( typeof objectA === "object" ) {
				// Check if they have the same constructor, so that we are comparing apples with apples.
				if ( objectA.constructor === objectA.constructor ) {
					// If we are working with Arrays...
					if ( methods.typeOf( objectA ) === "array" ) {
						// Check the arrays are the same length. If not, they cannot be the same.
						if ( objectA.length === objectB.length ) {

							// Compare each element. They must be identical. If not, the comparison stops immediately and returns false.
							if ( map && map.$sort ) {
								(function () {
									var objectASorted,
										objectBSorted,
										sortByID;
										
									if ( typeof map.$sort === true && map.$unid ) {
										sortByID = function ( a, b ) {
											var af = ( a[ map.$unid ] !== undefined ) ? a[ map.$unid ] : 0,
												bf = ( b[ map.$unid ] !== undefined ) ? b[ map.$unid ] : 0,
												r = 0;
											
											if ( af !== bf ) {
												r = ( af < bf ) ? -1 : 1;
											}
											
											return r;
										};
										
										objectASorted = objectA.concat().sort( sortByID );
										objectBSorted = objectB.concat().sort( sortByID );
									}
									else if ( typeof map.$sort === "function" ) {
										objectASorted = objectA.concat().sort( map.$sort );
										objectBSorted = objectB.concat().sort( map.$sort );
									}
									else {
										objectASorted = objectA.concat().sort();
										objectBSorted = objectB.concat().sort();
									}
		
									return objectASorted.every(
										function ( element, i ) {
											return methods.equals( element, objectBSorted[ i ], ( map.$child ) ? map.$child : null );
										}
									);
								})();
							}
							else {
								return objectA.every(
									function ( element, i ) {
										return methods.equals( element, objectB[ i ], ( map.$child ) ? map.$child : null );
									}
								);
							}
						}
						// They are not the same length, and so are not identical.
						else {
							return false;
						}
					}
					// If we are working with RegExps...
					else if ( objectA instanceof RegExp ) {
						// Return the results of a string comparison of the expression.
						return ( objectA.toString() === objectB.toString() );
					}
					// Else we are working with other types of objects...
					else {
						// Get the keys as arrays from both objects. This uses Object.keys, so no old browsers here.
						keysA = Object.keys( objectA );
		
						keysB = Object.keys( objectB );
						
						/*
						// We don't need two check keys from both objects if they have the same number of keys
						keysBDifference = keysB.filter(
							function ( element ) {
								if ( keysA.indexOf( element ) === -1 ) {
									return true;
								}
							}
						);
						*/
						
						if ( map ) {
							keysA = keysA.filter(
								function ( element ) {
									if ( map[ element ] !== false && map[ element ] !== null ) {
										return true;
									}
								}
							);
		
							keysB = keysB.filter(
								function ( element ) {
									if ( map[ element ] !== false && map[ element ] !== null ) {
										return true;
									}
								}
							);
						}
		
						// Check the key arrays are the same length. If not, they cannot be the same.
						if ( keysA.length === keysB.length ) {
							// Compare each property. They must be identical. If not, the comparison stops immediately and returns false.
							return keysA.every(
								function ( element ) {
									if ( map ) {
										return methods.equals( objectA[ element ], objectB[ element ], map[ element ] );
									}
									else {
										return methods.equals( objectA[ element ], objectB[ element ] );
									}
								}
							);
						}
						// They do not have the same number of keys, and so are not identical.
						else {
							return false;
						}
					}
				}
				// They don't have the same constructor.
				else {
					return false;
				}
			}
			// If they are both functions, let us do a string comparison.
			else if ( typeof objectA === "function" ) {
				return ( objectA.toString() === objectB.toString() );
			}
			// If a simple variable type, compare directly without coercion.
			else {
				return ( objectA === objectB );
			}
		
			// Return a default if nothing has already been returned.
			return result;
		};
	
		////////////////////////////////////////
		// 
		// differences
		// Identify and notify for all differences between two objects
		// callback( path, status, valueA, valueB )
		// 
		// Object A is assumed to be 'new', and Object B is assumed to be 'old'
		// 
		
		methods.differences = function ( objectA, objectB, options ) {
			var result = true,
				opts = {map: null, path: "", callback: null, mode: "all"}, // map, sorts, path, callback
				callback,
				map,
				pathParent = "",
				keysA,
				keysB,
				keysBDifference,
				keysMap,
				callbackTest,
				elementsResult = true;
			
			////////////////////////////////////////
			
			opts = methods.merge( opts, options );
			
			callback = opts.callback || null;

			////////////////////////////////////////
			
			if ( !opts.path ) {
				opts.path = "";
			}
			else {
				if ( opts.path && opts.path.length ) {
					pathParent = opts.path + ".";
				}
			}
		
			////////////////////////////////////////
		
			callbackTest = function ( result, status, valueA, valueB, path ) {
				if ( !path ) {
					path = opts.path;
				}
				
				if ( ( !result || opts.mode === "all" ) && path && callback && typeof callback === "function" ) {
					if ( opts.mode === "all" || ( status !== "equal" && status !== "array.equal" ) ) {
						callback( path, status, valueA, valueB );
					}
				}
			};
		
			////////////////////////////////////////
			
			opts.map = mapHandler( opts.map );
			
			map = opts.map;
			
			////////////////////////////////////////
		
			// Check if they are pointing at the same variable. If they are, no need to test further.
			if ( objectA === objectB ) {
				result = true;
				
				callbackTest( result, "equal", objectA, objectB );
				
				return true;
			}

			////////////////////////////////////////
			
			// Check if they are the same type. If they are not, no need to test further.
			if ( methods.typeOf( objectA ) !== methods.typeOf( objectB ) ) {
				result = false;
		
				callbackTest( result, "type.mismatch", objectA, objectB );
		
				return result;
			}

			////////////////////////////////////////
			
			// Check what kind of variables they are to see what sort of comparison we should make.
			if ( typeof objectA === "object" ) {
				// Check if they have the same constructor, so that we are comparing apples with apples.
				if ( objectA.constructor === objectB.constructor ) {
					// If we are working with Arrays...
					if ( methods.typeOf( objectA ) === "array" ) {
						// Check the arrays are the same length. If not, they cannot be the same.
						
						// $compare: "simple"
						// $compare: "basic"
						
						// Sort arrays
						// Iterate over array A
						// if match, store match iter
						// if none

						// array.added
						// array.changed
						// array.removed
						// array.noid
						
						// array.mismatch
						
						(function () {
							var objectASorted,
								objectBSorted,
								sortByID,
								objectALength,
								objectBLength,
								startB = 0,
								totalCounter = 0,
								uniqueCounter = 0,
								foundAny = false,
								mapChild = null;

								objectALength = objectA.length;
								objectBLength = objectB.length;
							
							if ( ( map && map.$compare && map.$compare === "simple" ) || !map ) {
								if ( objectA.length !== objectB.length ) {
									result = false;
								
									callbackTest( result, "array.mismatch", objectA, objectB );
								
									return result;
								}
							}
							
							if ( map && map.$sort ) {
								if ( map.$sort === true && map.$unid ) {
									sortByID = function ( a, b ) {
										var af = ( a[ map.$unid ] !== undefined ) ? a[ map.$unid ] : 0,
											bf = ( b[ map.$unid ] !== undefined ) ? b[ map.$unid ] : 0,
											r = 0;
										
										if ( af !== bf ) {
											r = ( af < bf ) ? -1 : 1;
										}
										
										return r;
									};
									
									objectASorted = objectA.concat().sort( sortByID );
									objectBSorted = objectB.concat().sort( sortByID );
								}
								else if ( typeof map.$sort === "function" ) {
									objectASorted = objectA.concat().sort( map.$sort );
									objectBSorted = objectB.concat().sort( map.$sort );
								}
								else {
									objectASorted = objectA.concat().sort();
									objectBSorted = objectB.concat().sort();
								}
							}
							else {
								objectASorted = objectA;
								objectBSorted = objectB;
							}
							
							if ( map && map.$child ) {
								mapChild = map.$child;
							}
							
							// Should we do a simple comparison of the array?
							// If the arrays are not the same length, it fails
							if ( map && map.$compare && map.$compare === "simple" ) {
								if ( objectA.length === objectB.length ) {
									// Compare each element. They must be identical. If not, the comparison stops immediately and returns false.
						
									objectASorted.forEach(
										function ( element, i ) {
											elementsResult = methods.differences( element, objectBSorted[ i ], {map: mapChild, path: pathParent + i, callback: callback, mode: opts.mode} );
								
											if ( elementsResult ) {
												callbackTest( true, "array.equal", element, objectBSorted[ j ], pathParent + i );
											}
											else {
												callbackTest( false, "array.changed", element, objectBSorted[ j ], pathParent + i );
												result = false;
											}
										}
									);
								}
								// They are not the same length, and so are not identical.
								else {
									result = false;
								
									callbackTest( result, "array.mismatch", objectA, objectB, path );
								
									return result;
								}
							}
							else {								
								// array.added
								// array.changed
								// array.removed
								// array.noid
								
								objectASorted.forEach(
									function ( element, i ) {
										var uniqueAIDValue,
											uniqueBIDValue,
											originalStartB = startB,
											j = startB,
											k = 0,
											objectBItem,
											found = false,
											first = false;
										
										// If there's a unique ID, we should expect elements to have them for a safe comparison
										if ( map ) {
	
											// A unique ID property has been defined that we should look for.
											// If we don't have one, we do naive comparison, one to one.
											if ( element[ map.$unid ] !== undefined ) {
												// This element has a unique ID
												uniqueAIDValue = element[ map.$unid ];
											}
											else {
//												console.warn( "No unique id for this element." )
												// It doesn't have the unique ID property
												// Compare to the first one that doesn't have the unique ID property, and so on.
												
											}				
											
											for ( ; j < objectBLength; j++ ) {
												objectBItem = objectBSorted[ j ];
												
												if ( map.$unid ) {
													if ( element[ map.$unid ] !== undefined ) {
														
														// && objectBItem[ map.$unid ] !== undefined
														// Element B also has to have the unique ID
														if ( element[ map.$unid ] === objectBItem[ map.$unid ] ) {
															startB = j + 1;
															found = true;
															
															if ( !foundAny ) {
																foundAny = true;
																first = true;
															}
															
															// It's the same item
															elementsResult = methods.differences( element, objectBSorted[ j ], {map: mapChild, path: pathParent + i, callback: callback, mode: opts.mode} );
															
															if ( elementsResult ) {
																callbackTest( true, "array.equal", element, objectBSorted[ j ], pathParent + i );
															}
															else {
																callbackTest( false, "array.changed", element, objectBSorted[ j ], pathParent + i );
															}
															
															break;
														}
														else {
															
														}
													}
													else {
														// It doesn't have the unique ID property
														// Compare to the first one that doesn't have the unique ID property, and so on.
													}
												}
												else {
													if ( element === objectBItem ) {
														// It's the same item
														startB = j + 1;
														found = true;
								
														if ( !foundAny ) {
															foundAny = true;
															first = true;
														}
								
														totalCounter++;
														callbackTest( true, "array.matched", element, objectBItem, pathParent + i );
								
														break;
													}
													else {
														// No match, ignore it and move on
								//						console.log( "No match between A Element " + i + ": " + element[ opts.map.$unid ] + " and B Element " + j + ": " + objectBItem[ opts.map.$unid ] + ";" )
													}
												}	
											}
											
											// If this is the first matched item
											if ( first ) {
												// if the found index is not the first and less than the array length (it should be, if an item was found)
												if ( j > 0 && j < objectBLength ) {
													for ( k = 0; k < j; k++ ) {
														// For each k
														totalCounter++;
														callbackTest( false, "array.removed", null, objectBSorted[ k ], pathParent + k );
													}
												}
											}
											// Or if there was a gap in matches
											else if ( j > originalStartB && j < objectBLength ) {
												for ( k = originalStartB; k < j; k++ ) {
													// For each k
													totalCounter++;
													callbackTest( false, "array.removed", null, objectBSorted[ k ], pathParent + k );
												}
											}
											
											// If no matches were found for this item
											if ( !found ) {
												// The element is new
												totalCounter++;
												callbackTest( false, "array.added", element, null, pathParent + i );
											}
										}
										// There no unique ID. We must assume a 1-to-1 mapping for testing.
										else {
											totalCounter++;
											elementsResult = methods.differences( element, objectBSorted[ i ], {map: mapChild, path: pathParent + i, callback: callback, mode: opts.mode} );
											
											if ( elementsResult ) {
												callbackTest( true, "array.equal", element, objectBSorted[ j ], pathParent + i );
											}
											else {
												callbackTest( false, "array.changed", element, objectBSorted[ j ], pathParent + i );
											}
										}
									
										// Check if this is the last one
										if ( i === ( objectALength - 1 ) ) {
											// We're still starting the loop from 0
											// It means we found no matches
											if ( startB < objectBLength ) {
												for ( k = startB; k < objectBLength; k++ ) {
													// For each k
													totalCounter++;
													callbackTest( false, "array.removed", null, objectBSorted[ k ], pathParent + k );
												}
											}
										}
									}
								);
								
								if ( !elementsResult ) {
									result = false;
								}
							}
						})();
					}
					// If we are working with RegExps...
					else if ( objectA instanceof RegExp ) {
						// Return the results of a string comparison of the expression.
						result = ( objectA.toString() === objectB.toString() );
		
						callbackTest( result, "regex.mismatch", objectA, objectB );
		
						return result;
					}
					// Else we are working with other types of objects...
					else {
						// Get the keys as arrays from both objects. This uses Object.keys, so no old browsers here.
						keysA = Object.keys( objectA );
		
						keysB = Object.keys( objectB );
		
						keysBDifference = keysB.filter(
							function ( element ) {
								if ( keysA.indexOf( element ) === -1 ) {
									return true;
								}
							}
						);
		
						if ( map ) {
							keysA = keysA.filter(
								function ( element ) {
									if ( map[ element ] !== false && map[ element ] !== null ) {
										return true;
									}
								}
							);
							
							/*
							keysB = keysB.filter(
								function ( element ) {
									if ( map[ element ] !== false && map[ element ] !== null ) {
										return true;
									}
								}
							);
							*/
					
							keysBDifference = keysBDifference.filter(
								function ( element ) {
									if ( map[ element ] !== false && map[ element ] !== null ) {
										return true;
									}
								}
							);
						}
		
						// Compare each property. They must be identical. If not, the comparison stops immediately and returns false.
						keysA.forEach(
							function ( element ) {
								var keysResult = true;
		
								keysResult = methods.differences( objectA[ element ], objectB[ element ], {map: ( map ) ? map[ element ] : null, path: pathParent + element, callback: callback, mode: opts.mode} );
		
								if ( !keysResult ) {
									result = false;
								}
							}
						);
						
						if ( keysBDifference.length ) {
							result = false;
						}
		
						// Compare each property. They must be identical. If not, the comparison stops immediately and returns false.
						keysBDifference.forEach(
							function ( element ) {
								callbackTest( false, "property.removed", null, objectB[ element ], pathParent + element );
							}
						);
		
						return result;
					}
				}
				// They don't have the same constructor.
				else {
					result = false;
		
					callbackTest( result, "constructor.mismatch", objectA, objectB );
		
					return result;
				}
			}
			// If they are both functions, let us do a string comparison.
			else if ( typeof objectA === "function" ) {
				result = ( objectA.toString() === objectB.toString() );
		
				callbackTest( result, ( result ? "equal" : "function.mismatch" ), objectA, objectB );
		
				return result;
			}
			// If a simple variable type, compare directly without coercion.
			else {
				result = ( objectA === objectB );
		
				callbackTest( result, ( result ? "equal" : "value.mismatch" ), objectA, objectB );
		
				return result;
			}

			////////////////////////////////////////
			
			// Return a default if nothing has already been returned.
			return result;
		};

		
		return methods;
	}
)();

////////////////////////////////////////

module.exports = comparisons;

////////////////////////////////////////////////////////////////////////////////
