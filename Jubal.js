class Context {
    constructor(numberOfAttributes) {
        this.numberOfAttributes = numberOfAttributes;
        this.numberOfObjects = 0;
        this.incidences = [];
    }

    addObject(atts) {
        this.numberOfObjects++;
        // FIll atts with zeros if necessary
        if(atts.length < this.numberOfAttributes) {
            for(let i = atts.length; i < this.numberOfAttributes; i++) {
                atts.push(0);
            }
        } 
        this.incidences.push(atts);
    }

    addAttribute() {
        this.numberOfAttributes++;
        for(let i = 0; i < this.numberOfObjects; i++) {
            this.incidences[i].push(0);
        }
    }

    setIncidence(obj, att, value) {
        if(obj > this.numberOfObjects || att > this.numberOfAttributes) {
            console.log("Error: Indices out of bounds");
            return;
        }
        this.incidences[obj][att] = value;
    }

    deleteObject(obj) {
        if(obj > this.numberOfObjects) {
            console.log("Error: Index out of bounds");
            return;
        }
        this.numberOfObjects--;
        this.incidences.splice(obj, 1);
    }

    deleteAttribute(att) {
        if(att > this.numberOfAttributes) {
            console.log("Error: Index out of bounds");
            return;
        }
        this.numberOfAttributes--;
        for(let i = 0; i < this.numberOfObjects; i++) {
            this.incidences[i].splice(att, 1);
        }
    }

    objectIntent(obj) {
        if(obj > this.numberOfObjects) {
            console.log("Error: Index out of bounds");
            return;
        }
        let result = [];
        for(let i = 0; i < this.numberOfAttributes; i++) {
            if(this.incidences[obj][i] === 1) {
                result.push(i);
            }
        }
        return result;
    }

    attributeExtent(att) {
        if(att > this.numberOfAttributes) {
            console.log("Error: Index out of bounds");
            return;
        }
        let result = [];
        for(let i = 0; i < this.numberOfObjects; i++) {
            if(this.incidences[i][att] === 1) {
                result.push(i);
            }
        }
        return result;
    }

    intent(objs) {
        if(objs.length === 0) return range(0, this.numberOfAttributes);

        let intents = [];
        for(let i = 0; i < objs.length; i++) {
            intents.push(this.objectIntent(objs[i]));
        }
        let result = intents[0];
        for(let i = 1; i < intents.length; i++) {
            result = result.filter(x => intents[i].includes(x));
        }
        return result;
    }

    extent(atts) {
        if(atts.length === 0) return range(0, this.numberOfObjects);

        let extents = [];
        for(let a of atts) {
            extents.push(this.attributeExtent(a));
        }
        let result = extents[0];
        for(let i = 1; i < extents.length; i++) {
            result = result.filter(x => extents[i].includes(x));
        }
        return result;
    }

    intentHull(atts) {
        return this.intent(this.extent(atts));
    }
    
    extentHull(objs) {
        return this.extent(this.intent(objs));
    }

    _smaller(objsA, index, objsB) {
        // check if index is in objsB, but not in objsA
        let firstCheck = objsB.includes(index) && !objsA.includes(index);
        if(!firstCheck) return false;

        //let secondCheck = objsA.filter(o => o < index).every(o => objsB.filter(k => k < index).includes(o));
        let smallerA = objsA.filter(o => o < index);
        let smallerB = objsB.filter(o => o < index);
        return smallerA.length === smallerB.length && smallerA.every(o => smallerB.includes(o));
    }

    _oPlus(objs, index) {
        objs = objs.filter(o => o < index).concat([index])
        return this.extentHull(objs);
    }

    nextExtent(givenExtent) {
        // all indices from 0 to object.length that are not in givenExtent
        let leftovers = [];
        for(let i = 0; i < this.numberOfObjects; i++) {
            if(!givenExtent.includes(i)) {
                leftovers.push(i);
            }
        }

        leftovers = leftovers.reverse();
        for(let l of leftovers) {
            let candidate = this._oPlus(givenExtent, l);
            if(this._smaller(givenExtent, l, candidate)) {
                return candidate;
            }
        }
    }

    computeAllExtents() {
        let result = [this.extentHull([])];
        let finished = false;
        while(!finished) {
            let next = this.nextExtent(result[result.length - 1]);
            result.push(next);
            finished = next.length === this.numberOfObjects;
        }
        return result;
    }
}


// *********************************************************************************************

class conceptNode {
    constructor(extent, intent) {
        this.extent = extent;
        this.intent = intent;
    }
}

class conceptLattice {
    constructor(context) {
        let extents = context.computeAllExtents();
        let n = extents.length;
        this.nodes = [];

        // An array of size n times n filled with zeros.
        this.incidences = [];
        this.neighbors = [];
        for(let i = 0; i < n; i++) {
            this.incidences.push([]);
            this.neighbors.push([]);
            for(let j = 0; j < n; j++) {
                this.incidences[i].push(0);
                this.neighbors[i].push(null);
            }
        }

        for(let i = 0; i < n; i++) {
            this.nodes.push(new conceptNode(extents[i], context.intent(extents[i])));
            for(let j = 0; j < n; j++) {
                if(i !== j && subset(extents[i], extents[j])) {
                    this.incidences[i][j] = 1;
                }
            }
        }

        for(let i = 0; i < n; i++) {
            for(let j = 0; j < n; j++) {
                if(this.incidences[i][j] === 1) {
                    let inBetween = false;
                    for(let k = 0; k < n; k++) {
                        inBetween = inBetween || (this.incidences[i][k] === 1 && this.incidences[k][j] === 1);
                    }
                    if(!inBetween) {
                        this.neighbors[i][j] = 1;
                    }
                }
            }
        }
    }
}

// *********************************************************************************************

function range(start, end) {
    let result = [];
    for(let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}

function subset(setA, setB) {
    return setA.every(x => setB.includes(x));
}