//WHAT I WANT
//  To drop in distances and times, and have an object that stores the amount for each

class TravelMethod {
    constructor(routeId, typeName, unitEmission, subtype = null, useTime = false) {
        this.routeId = routeId;
        this.useTime = useTime;
        this.unitEmission = unitEmission;
        this.subtype = subtype;
        this.typeName = typeName;
        this.co2produced = 0;
        this.routeExists = false
        this.distanceKey = `distance-${routeId}`
        this.timeKey = `traveltime-${routeId}`
    }
    calcEmission(distance, time) {
        this.co2produced = this.useTime
            ? (time / 3600) * this.unitEmission
            : distance * this.unitEmission;
        return this.co2produced;
    }
    getCalcEmission() {
        this.getRouteExists()
        //get the data for this method from session storage, then calc
        let distance = JSON.parse(sessionStorage.getItem(this.distanceKey));
        let travelTime = JSON.parse(sessionStorage.getItem(this.timeKey));
        if (this.routeExists){
            return this.calcEmission(distance, travelTime);
        } else {
            return null //For routes not found
        }
    }
    usageString() {
        this.getRouteExists()
        if (this.routeExists){
            return `${this.subtype ? this.subtype : this.typeName} your journey will produce ${this.getCalcEmission().toFixed(2)} grams of CO2`;
        } else {
            return `The route was not found for ${this.subtype ? this.subtype : this.typeName}`
        }
    }
    getRouteExists(){
        this.routeExists = Boolean(sessionStorage.getItem(this.distanceKey))
    }
    saveEmission(){
        //saves the emission to sessionStorage, only if the route exists
        if (this.routeExists){
            sessionStorage.setItem(`emission-${this.subtype ? this.subtype : this.typeName}`, JSON.stringify(this.getCalcEmission().toFixed(2)));
        }
    }
    getRepr(){
        
        return {name: this.subtype ? this.subtype : this.typeName, emission: this.getCalcEmission().toFixed(2)}
    }

}

const emissionObjects = [];
const carSubtype = ["Micro-car", "Compact-car", "Sedan", "Suv"];
const fuelEmissionsCar = [
    {
        name: "gasoline",
        emissions: [125.0692, 147.144, 156.4524, 230.2278],
    },
    {
        name: "diesel",
        emissions: [115.6062, 138.82, 141.0578, 170.4394],
    },
    {
        name: "electric",
        emissions: [7.7, 7.7, 7.7, 7.7],
    },
];

//creating car objects
carSubtype.forEach(function (subtype, rootindex) {
    fuelEmissionsCar.forEach(function (emissionType) {
        emissionObjects.push(
            new TravelMethod(
                "car",
                `${subtype}`,
                emissionType.emissions[rootindex],
                `${subtype.toLowerCase()}-${emissionType.name}`
            )
        );
    });
});

emissionObjects.push(new TravelMethod("pt", "public transportation", 64));

//for biking and walking, the consumption is based on calories burnt
// g/cal = 7/20 based on average weight
// average of 250 calories per hour over resting rate walking at 4.8 km/h
// therefore timeInHours*250cals/hour*7/20g/cal = 87.5
//https://www.healthline.com/health/how-many-calories-do-you-burn-biking#slow-vs-fast
//biking 596 cals/hour
emissionObjects.push(new TravelMethod("bike", "biking", 208.6, null, true)); //https://keith.seas.harvard.edu/blog/climate-impacts-biking-vs-driving
//https://www.eta.co.uk/2011/12/13/co2-emissions-from-cycling-revealed/
emissionObjects.push(new TravelMethod("walk", "walking", 87.5, null, true));