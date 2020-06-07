// const choiceRanking =
const options = [
    {
        // CO2 emission in g/km, data by: https://www.carbonfootprint.com/
        id: "car",
        mode: ["micro-car", "compact-car", "sedan", "suv"],
        gas: ["gasoline", "diesel", "electric"],
        coEmissionGasoline: [125.0692, 147.144, 156.4524, 230.2278],
        coEmissionDiesel: [115.6062, 138.82, 141.0578, 170.4394],
        coEmissionElectric: 7.7, // Considering the current mix of energy production in Ontario: https://www.cer-rec.gc.ca/nrg/ntgrtd/mrkt/snpsht/2018/09-01-1hwrnrgprjctsfnncd-eng.html
    },
    {
        // Generalized CO2 emission for trucks: https://www.transportenvironment.org/sites/te/files/publications/2015%2009%20TE%20Briefing%20Truck%20CO2%20Too%20big%20to%20ignore_FINAL.pdf
        id: "truck",
        mode: "truck",
        coEmission: 924,
    },
    {
        // CO2 emission in g/km, TTC as an example: http://www.ttc.ca/PDF/About_the_TTC/Sustainability_Reports/2013_Sustainability_Report.PDF
        id: "pt",
        mode: "publicTransport",
        coEmission: 64,
    },
    {
        id: "bike",
        mode: "bike",
        coEmission: 0,
    },
    {
        id: "walk",
        mode: "pedestrian",
        coEmission: 0,
    },
];

function rankChoice(chosenMethod) {
    //This is missing all of the data regarding electric vs diesel, so for right now this is something that kinda works
    if (["walk", "bike"].includes(chosenMethod)) {
        return "1st";
    }
    let rank = (["pt", "car", "truck"].indexOf(chosenMethod) + 2).toString();
    console.log(rank);
    if (rank[rank.length - 1] == "2") {
        return rank + "nd";
    } else if (rank[rank.length - 1] == "3") {
        return rank + "rd";
    } else if (
        ["4", "5", "6", "7", "8", "9", "0"].includes(rank[rank.length - 1])
    ) {
        return rank + "th";
    }
}

instantiateMap();

const chosenMethod = loadFromSession("detail-method-selected");
if (!chosenMethod) {
    errorModal(
        "You haven't selected a method to see details for, please return to the previous page"
    );
}
const routeKey = mapKeyTranslator(chosenMethod);

mapRoute(routeKey);

$("#destination-name").text(
    loadFromSession("destination")
        .address.label.split(",")
        .slice(0, 1)
        .toString()
);
$("#transport-method").text(keyTranslator(chosenMethod).toLowerCase());
$("#travel-text").text(loadFromSession(`travel-text-${routeKey}`));
$("#method-ranking").text(rankChoice(routeKey));

//This is an array of metrics, I'll sort randomly and choose two to use as comparators,
//displaying them in order of units/time
//input will be in grams, I'll divide by the rate
//https://onetreeplanted.org/blogs/stories/planting-trees-reduce-carbon-footprint -> Tree sequesters at 48 pounds of carbon dioxide per year
//https://www.carbonindependent.org/22.html -> 90 kg CO2 per hour
//https://www.treehugger.com/travel/spacex-launch-puts-out-much-co2-flying-341-people-across-atlantic.html
//http://css.umich.edu/factsheets/carbon-footprint-factsheet ->
//https://www.globalcitizen.org/es/content/5-reasons-cow-farts-matter-and-could-destroy-the-w/ -> 84xx
//https://www.wired.co.uk/article/the-strange-war-against-cow-farts -> 240L is 132.96 g . day
//https://www.bbc.com/news/science-environment-49349566 ->
let comparisonMetrics = [
    { description: " days of a ten year old tree's consumption", rate: 59.65 },

    { description: " days of methane from cow flatus", rate: 132.96 },
    {
        description: " passenger kilometres travelled on a domestic flight",
        rate: 133,
    },
    {
        description: " passenger kilometres travelled on a long haul flight",
        rate: 102,
    },
    { description: " passenger kilometres travelled by rail", rate: 41 },
    { description: " passenger kilometres travelled on the eurostar", rate: 6 },
];

let chosenRate = loadFromSession("detail-method-rate-chosen");
//WE CAN ADD METRICS, I RANDOMLY CHOOSE THREE EACH TIME
if (chosenRate == 0) {
    $("#relative-section").addClass("d-none");
    $("#zero-co2-note").removeClass("d-none");
    $("#comparison-graph-title").removeClass("my-5")
    $("#comparison-graph-title").addClass("mb-5")
} else {
    //choosing three metrics, calculating the data relevant for each
    let i = 0;
    let comparators = [];
    while (i < 3) {
        i++;
        let randItem = Math.floor(Math.random() * comparisonMetrics.length);
        comparators.push(comparisonMetrics[randItem]);
        comparisonMetrics.splice(randItem, 1);
    }

    if (chosenRate != 0) {
        comparators.forEach(function (comparator) {
            comparatorRate = (chosenRate / comparator.rate).toFixed(2);
            console.log(comparatorRate, "comp rate", comparator);
            $("#co2-metrics ul").append(
                `<li><span class="green ml-1">${comparatorRate}</span>${comparator.description}</li>`
            );
        });
    }
    $("#co2-amount").text(chosenRate);
}

//TURN BY TURN DIRECTIONS
$("#show-directions").click(function (event) {
    console.log(`I was clicked, something is working`);
    //Expand frame, render line by line instructions in foreach
});

//ADDING METRICS
