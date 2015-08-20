core.service("Utility",function() {

	var Utility = this;

	/*
	 *	Filter
	 *	
	 *	@param objList		the list of objects to be filtered
	 *	@param properties	the properties of the object to filter against
	 *	@param target		the target facet to filter for
	 *	@param position		optional argument in which to filter at a specific position in the property
	 *
	 *	@returns filtered list of objects
	 *
	 */
	Utility.filter = function(objList, properties, target, position) {

		return objList.filter(function(obj) {

			for(var i in properties) {
				if(typeof position != 'undefined') {					
					if(obj[properties[i]] != null) {
						if(typeof obj[properties[i]] == 'object') {
							for(var o in obj[properties[i]]) {
								if(obj[properties[i]][o] != null) {
									if(typeof obj[properties[i]][o] == 'object') {
										for(var p in obj[properties[i]][o]) {
											if(obj[properties[i]][o][p].toUpperCase().indexOf(target.toUpperCase()) == position) {
												return true;
											}
										}
									}
									else {
										if(obj[properties[i]][o].toUpperCase().indexOf(target.toUpperCase()) == position) {
											return true;
										}
									}
								}
							}
						}											
						else if(typeof obj[properties[i]] == 'number') {
							console.log("Can not filter on a position of a number!");
							return false;
						}

						if(obj[properties[i]].toUpperCase().indexOf(target.toUpperCase()) == position) {
							return true;
						}
					}
				}
				else {
					if(obj[properties[i]] != null) {
						if(typeof obj[properties[i]] == 'number') {
							if(target.indexOf(obj[properties[i]]) > -1) {
								return true;
							}							
						}
						else {
							if(obj[properties[i]] instanceof Array) {
								if(target == 0) {
									if(obj[properties[i]].length == target) {
										return true;
									}
								}
								else {
									if(obj[properties[i]].length >= target) {
										return true;
									}
								}
							}
							else {
								if(typeof obj[properties[i]] == 'object') {
									for(var o in obj[properties[i]]) {
										if(obj[properties[i]][o] != null) {
											if(typeof obj[properties[i]][o] == 'object') {
												for(var p in obj[properties[i]][o]) {
													if(obj[properties[i]][o][p].toUpperCase().indexOf(target.toUpperCase()) > -1) {
														return true;
													}
												}
											}
											else {
												if(obj[properties[i]][o].toUpperCase().indexOf(target.toUpperCase()) > -1) {
													return true;
												}
											}
										}
									}
								}
								else {
									if(obj[properties[i]].toUpperCase().indexOf(target.toUpperCase()) > -1) {
										return true;
									}
								}
							}														
						}

					}					
				}
			}
			return false;
		});

	};

	/*
	 *	Binary Search
	 *	
	 *	@param objList		the list of objects to be searched
	 *	@param property		the property of the object to searching against
	 *	@param ordered		whether the list if ordered by the specified property
	 *	@param target		the target searching for
	 *	@param position		optional argument in which to search at a specific position in the property
	 *
	 *	@returns the target object
	 *
	 */
	Utility.search = function(objList, property, ordered, target, position) {
		
		var isNumber = (typeof target == 'number');
		
		if(!isNumber) {
			target = target.toUpperCase();
		}
		
		
		if(!ordered) {
			objList = Utility.quickSort(objList, property, isNumber, position);
			ordered = true;
		}

		var start = 0;
		var end = objList.length;

		var index = Math.round((end-start) / 2);

		while(index > -1) {

			var match = null;

            if(typeof position != 'undefined') {
            	match = objList[index][property].substring(position, position + target.length).toUpperCase();            	
            }
            else {
            	if(!isNumber) {
            		match = objList[index][property].toUpperCase();
            	}
            	else {
            		match = objList[index][property];
            	}
            }

            if(isNumber) {
            	if(match == target) {
					break;
	            }
            }
            else {
            	if(match.indexOf(target) > -1) {
					break;
	            }
            }
            
            if(match < target) {
            	start = index;
            	index += Math.round((end-start) / 2);
            }
            else {
            	end = index;
            	index -= Math.round((end-start) / 2);
            }

		}

		return objList[index];

	};

	/*
	 *	Quck Sort
	 *
	 *	@param objList		the list of objects to be sorted
	 *	@param property		the property of the object to sort against
	 *	@param position		optional argument in which to sort at a specific position in the property
	 *
	 */
	Utility.quickSort = function(objList, property, isNumber, position) {

	    if(objList.length == 0) {
	    	return [];
	 	}

	    var left = [], right = [];
	    var pivot = null;

	    if(typeof position != 'undefined') {
	    	pivot = objList[0];

	    	for(var i = 1; i < objList.length; i++) {
		        objList[i][property].substring(position, objList[i][property].length).toUpperCase() < pivot[property].substring(position, pivot[property].length).toUpperCase() ? left.push(objList[i]) : right.push(objList[i]);
		    }
	 	}
	 	else {
	 		pivot = objList[0];

	 		for(var i = 1; i < objList.length; i++) {
	 			if(!isNumber) {
	 				objList[i][property].toUpperCase() < pivot[property].toUpperCase() ? left.push(objList[i]) : right.push(objList[i]);
	 			}
	 			else {
	 				objList[i][property] < pivot[property] ? left.push(objList[i]) : right.push(objList[i]);
	 			}
		        
		    }
	 	}
	 
	    return Utility.quickSort(left, property, isNumber, position).concat(pivot, Utility.quickSort(right, property, isNumber, position));
	}

	return Utility;

});
