// const directions-contents = JSON.parse(sessionStorage.)
const methodSelected = loadFromSession("detail-method-selected");
const directionList = loadFromSession(`directions-${mapKeyTranslator(methodSelected)}`);
// const directionList = loadFromSession(`directions-${mapKeyTranslator('pt')}`);
directionList.forEach(function(line, index){
    console.log(line)
    $("#directions").append(`<p>${index+1} : ${line.instruction}`)
})