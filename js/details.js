// Get results array from local storage
var storageResults = JSON.parse(sessionStorage.getItem("results"));
var allModes = [];
var co2Values = [];

// Split up results array into two new arrays to populate the graph
for(i=0; i<storageResults.length; i++){
    allModes.push(keyTranslator(storageResults[i].mode)); 
    co2Values.push(storageResults[i].co2);
}

// Render graph
var ctx = document.getElementById('emissionsGraph').getContext('2d');
var chart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: allModes,
        datasets: [{
            label: 'CO2 Emmisions',
            backgroundColor: 'rgb(20, 125, 20)',
            borderColor: 'rgb(20, 125, 20)',
            borderWidth: 1,
            data: co2Values
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
    
// Create 3 comparison values for context of co2 impact
    // 1 tree can remove 48 lbs of co2 in a year https://www.co2meter.com/blogs/news/could-global-co2-levels-be-reduced-by-planting-trees#:~:text=A%20typical%20hardwood%20tree%20can,it%20reaches%2040%20years%20old.
    // Find no. 2
    // Find no. 3 



//Filling in map content
instantiateMap()
