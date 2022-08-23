console.log("Starting Jubal.js");

class Context {
    constructor(attributes) {
        this.attributes = attributes;
        this.objects = [];
        this.incidences = [];
    }

    addObject(obj, atts) {
        this.objects.push(obj);
        let inci = [];
        for(a of this.attributes) {
            inci.push(atts.includes(a) ? 1 : 0);
        }
        this.incidences.push(inci);
    }

    addAttribute(att) {
        this.attributes.push(att);
        for(i of this.incidences) {
            i.push(0);
        }
    }

    setIncidence(obj, att, value) {
        this.incidences[this.objects.indexOf(obj)][this.attributes.indexOf(att)] = value;
    }

    deleteObject(obj) {
        let index = this.objects.indexOf(obj);
        this.objects.splice(index, 1);
        this.incidences.splice(index, 1);
    }

    deleteAttribute(att) {
        let index = this.attributes.indexOf(att);
        this.attributes.splice(index, 1);
        for(i of this.incidences) {
            i.splice(index, 1);
        }
    }

    objectIntent(obj) {
        if(typeof obj === "int") {
            return this.attributes.filter((a, i) => this.incidences[obj][i] === 1);
        }
        if(typeof obj === "string") {
            return this.objectIntent(this.objects.indexOf(obj));
        }
    }
    
    attributeExtent(att) {
        if(typeof att === "int") {
            return this.objects.filter((o, i) => this.incidences[i][att] === 1);
        }
        if(typeof att === "string") {
            return this.attributeExtent(this.attributes.indexOf(att));
        }
    }

    intent(objs) {
        let intents = [];
        for(o of objs) {
            intents.push(this.objectIntent(o));
        }
        let intent = intents[0];
        for(i = 1; i < intents.length; i++) {
            intent = intent.filter(a => intents[i].includes(a));
        }
        return intent;
    }

    extent(atts) {
        let extents = [];
        for(a of atts) {
            extents.push(this.attributeExtent(a));
        }
        let extent = extents[0];
        for(i = 1; i < extents.length; i++) {
            extent = extent.filter(o => extents[i].includes(o));
        }
        return extent;
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
        for(i = 1; i < this.objects.length; i++) {
            if(!givenExtent.includes(i)) {
                leftovers.push(i);
            }
        }

        let result = [];
        for(l of leftovers.reverse()) {
            let result = this.oPlus(givenExtent, l);
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