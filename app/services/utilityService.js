/**
 * @ngdoc service
 * @name  core.service:Utility
 *
 * @description
 *  A utility service for custom implementations of common tasks.
 *
 */
core.service("Utility", function () {

    var Utility = this;

    /**
     *	@ngdoc method
     *	@name  core.service:Utility#Utility.search
     *	@methodOf core.service:Utility
     *	@param {array} objList
     *	 the list of objects to be searched
     *	@param {string} property
     *	 the property of the object to searching against
     *	@param {boolean} ordered
     *	 whether the list if ordered by the specified property
     *	@param {string} target
     *	 the target searching for
     *  @param {number=} position
     *	 optional argument in which to search at a specific position in the property
     *	@param {boolean} exact
     *	 optional argument to only return an exact match
     *	@returns {object} returns the target object
     *
     * @description
     *  A binary search utility
     *
     */
    Utility.search = function (objList, property, ordered, target, position, exact) {

        var isNumber = (typeof target == 'number');

        if (!isNumber) {
            target = target.toUpperCase();
        }


        if (!ordered) {
            objList = Utility.quickSort(objList, property, isNumber, position);
            ordered = true;
        }

        var start = 0;
        var end = objList.length;

        var index = Math.round((end - start) / 2);

        while (index > -1) {

            var match = null;

            if (typeof position != 'undefined') {
                match = objList[index][property].substring(position, position + target.length).toUpperCase();
            } else {
                if (!isNumber) {
                    match = objList[index][property].toUpperCase();
                } else {
                    match = objList[index][property];
                }
            }

            if (isNumber) {
                if (match == target) {
                    break;
                }
            } else if (exact) {
                if (match === target)
                    break;
            } else {
                if (match.indexOf(target) > -1) {
                    break;
                }
            }

            if (match < target) {
                start = index;
                index += Math.round((end - start) / 2);
            } else {
                end = index;
                index -= Math.round((end - start) / 2);
            }

        }

        return objList[index];

    };

    /**
     *	@ngdoc method
     *	@name core.service:Utility#Utility.exactSearch
     *	@methodOf core.service:Utility
     *	@param {array} objList
     *	 the list of objects to be searched
     *	@param {string} property
     *	 the propery of the object to search against
     *	@param {string} target
     *	 the target searching for
     *	@returns {object} the target object
     *
     *	@description
     *	 An exact search utility.
     *
     */
    Utility.exactSearch = function (objList, property, target) {
        return Utility.search(objList, property, false, target, undefined, true);
    };

    /**
     *	@ngdoc method
     *	@name  core.service:Utility#Utility.quickSort
     *	@methodOf core.service:Utility
     *  @param {array} objList
     *	 the list of objects to be sorted
     *	@param {string} property
     *	 the property of the object to sort against
     *	@param {number=} position
     *	 optional argument in which to sort at a specific position in the property
     *	@returns {array} returns the sorted list of objects.
     *
     * @description
     *  A quicksort utility.
     *
     */
    Utility.quickSort = function (objList, property, isNumber, position) {

        if (objList.length == 0) {
            return [];
        }

        var left = [],
            right = [];
        var pivot = null;

        if (typeof position != 'undefined') {
            pivot = objList[0];

            for (var i = 1; i < objList.length; i++) {
                if (objList[i][property].substring(position, objList[i][property].length).toUpperCase() < pivot[property].substring(position, pivot[property].length).toUpperCase()) {
                    left.push(objList[i]);
                } else {
                    right.push(objList[i]);
                }
            }
        } else {
            pivot = objList[0];

            for (var j = 1; j < objList.length; j++) {
                if (!isNumber) {
                    if (objList[j][property].toUpperCase() < pivot[property].toUpperCase()) {
                        left.push(objList[j]);
                    } else {
                        right.push(objList[j]);
                    }
                } else {
                    if (objList[j][property] < pivot[property]) {
                        left.push(objList[j]);
                    } else {
                        right.push(objList[j]);
                    }
                }

            }
        }

        return Utility.quickSort(left, property, isNumber, position).concat(pivot, Utility.quickSort(right, property, isNumber, position));
    };

    return Utility;

});