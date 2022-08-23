console.log("Starting Jubal.js");

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
    }

    intent(objs) {
        let intents = [];
        for(o of objs) {
            intents.push(this.objectIntent(o));
        }
        let result = intents[0];
        for(let i = 1; i < intents.length; i++) {
            result = result.filter(x => intents[i].includes(x));
        }
        return result;
    }

    extent(atts) {
        let extents = [];
        for(a of atts) {
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

    smaller(objsA, index, objsB) {
        // check if index is in objsB, but not in objsA
        let firstCheck = objsB.includes(index) && !objsA.includes(index);
        if !firstCheck return false;

        // check if the elements of objsA smaller than index and the elements of objsB that are smaller than index are the same
        let secondCheck = objsA.filter(o => o < index).every(o => objsB.filter(o => o < index).includes(o));
        return secondCheck;
    }

    oPlus(objs, index) {
        return this.extentHull(obj.filter(o => objs.indexOf(o) < index).push(index));
    }

    nextExtent(givenExtent) {
        // all indices from 1 to object.length that are not in givenExtent
        let leftovers = [];
        for(let i = 1; i < this.numberOfObjects; i++) {
            if(!givenExtent.includes(i)) {
                leftovers.push(i);
            }
        }

        let result = [];
        for(l of leftovers.reverse()) {
            result =this.oPlus(givenExtent, l);
            if(this.smaller(givenExtent, l, result)) {
                return result;
            }
        }
        return result;
    }

    computeAllExtents() {
        result = [this.extentHull([])];
        let finished = false;
        while(!finished) {
            let next = this.nextExtent(result[result.length - 1]);
            if(next.length === 0) {
                finished = true;
            } else {
                result.push(next);
            }
        }
    }
}



