instantiateMap()
const chosenMethod = loadFromSession('detail-method-selected')
if (! chosenMethod) {
    errorModal("You haven't selected a method to see details for, please return to the previous page")
}
mapRoute(mapKeyTranslator(chosenMethod))
