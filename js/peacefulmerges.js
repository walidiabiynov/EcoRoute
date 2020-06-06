instantiateMap();

const chosenMethod = loadFromSession("detail-method-selected");
if (!chosenMethod) {
  errorModal(
    "You haven't selected a method to see details for, please return to the previous page"
  );
}
const routeKey = mapKeyTranslator(chosenMethod)

mapRoute(routeKey);


$("#destination-name").text(loadFromSession('destination').address.label.split(',').slice(0, 1).toString());
$("#transport-method").text(keyTranslator(chosenMethod).toLowerCase());
$("#travel-text").text(loadFromSession(`travel-text-${routeKey}`))
console.log(`travel-text-${routeKey}`)