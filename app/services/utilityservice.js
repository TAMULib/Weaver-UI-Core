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
						if(obj[properties[i]].toUpperCase().indexOf(target.toUpperCase()) == position) {
							return true;
						}
					}
				}
				else {
					if(obj[properties[i]] != null) {
						if(obj[properties[i]].toUpperCase().indexOf(target.toUpperCase()) > -1) {
							return true;
						}
					}
				}
			}

			return false;

		});

	};

	/*
	 *	Search
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
		
		target = target.toUpperCase();
		
		if(!ordered) {
			objList = Utility.quickSort(objList, property, position);
			ordered = true;
		}

		var index = objList.length;

        while(index > 1) {

            index = Math.round(objList.length / 2);
            
            var current = objList[index];

            var match = null;

            if(typeof position != 'undefined') {
            	match = objList[index][property].substring(position, position + target.length).toUpperCase();            	
            }
            else {
            	match = objList[index][property].toUpperCase();
            }

            if(match.indexOf(target) > -1) {
                index = 0;
            }
            else {
                if(match > target) {
                    objList = objList.slice(0, index);
                }
                else {
                    objList = objList.slice(index);
                }
            }

        }
        
        return current;

	};

	/*
	 *	Quck Sort
	 *
	 *	@param objList		the list of objects to be sorted
	 *	@param property		the property of the object to sort against
	 *	@param position		optional argument in which to sort at a specific position in the property
	 *
	 */
	Utility.quickSort = function(objList, property, position) {

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
		        objList[i][property].toUpperCase() < pivot[property].toUpperCase() ? left.push(objList[i]) : right.push(objList[i]);
		    }
	 	}
	 
	    return Utility.quickSort(left, property, position).concat(pivot, Utility.quickSort(right, property, position));
	}

	return Utility;

});
