(() => {// configure theRoom
  window.theRoom.configure({
    blockRedirection: true,
    createInspector: true,
    excludes: [],
    click: function (element, event) {
      debugger;
      event.preventDefault()
      event.stopPropagation();
      // get the unique css selector of the clicked element
      // and then copy it to clipboard
      navigator
        .clipboard
        .writeText(
          getSelector(element)
        )
        .then(
          function () {
            alert('The unique CSS selector successfully copied to clipboard')
          },
          function (err) {
            alert('The unique CSS selector could not be copied to clipboard')
          }
        )

      // so far so good
      // stop inspection
      window.theRoom.stop(true)
    },
    keydown: function (element, event) {
      // console.log("Inside keydown function in content.js");
      // console.log("Element Selected" + getSelector(element));
      var swalTemplateElement = document.getElementById('SwalTemplate');
      var swalTemplateContentCloned = swalTemplateElement.content.firstElementChild.cloneNode(true);
      var defaultSelector = getSelector(element);
      Swal.fire({
        html: swalTemplateContentCloned,
        showCloseButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonText: 'Save',
        willOpen: function (element) {
          window.theRoom.stop(true);
          var o9SplitViewElement = document.getElementById('__splitview__');
          if (o9SplitViewElement) {
            o9SplitViewElement.style.position = 'fixed';
          }
        },
        willClose: function (element) {
          var o9SplitViewElement = document.getElementById('__splitview__');
          if (o9SplitViewElement) {
            o9SplitViewElement.style.position = '';
          }
        },
        preConfirm: function () {
          //To get the element's input values and storing them before swal closes by confirm button
          var nameInputValue=document.querySelector('.nameInput.swal2-input')?.value;
          var selectorElementInputValue =document.querySelector('.selectorElementInput.swal2-input')?.value;
          var contentInputValue =document.querySelector('.contentInput.swal2-textarea')?.value;
          var eventTypeInputValue=document.querySelector('.eventTypeInput.swal2-input')?.value;
          return [nameInputValue,selectorElementInputValue,contentInputValue,eventTypeInputValue]
        }
      }).then(function (result) {
        if (result?.value) {
          //stepNumber to be added during runtime by comparing the storage's length
          var stepName, stepElementPath, stepDescription, stepEvent, stepUrl;
          [stepName, stepElementPath, stepDescription, stepEvent] = result.value;
          stepUrl = window.location.href;
          var urlObject = new URL(stepUrl);
          var hostName = urlObject.hostname;
          stepName = (stepName) ? stepName : 'Default StepName';
          stepElementPath = (stepElementPath) ? stepElementPath : defaultSelector;
          stepDescription = (stepDescription) ? stepDescription : 'Default Step Description';
          var stepPayload = {
            stepName: stepName,
            stepEvent: stepEvent,
            stepElementPath: stepElementPath,
            stepUrl: stepUrl,
            stepDescription: stepDescription
          }
          addStepData(hostName, stepPayload);
        }
        window.theRoom.start();
      });

      // so far so good
      // stop inspection
      // window.theRoom.stop(true);
    }
  });

  //Global vars
  var activeTourId=undefined;

  var generateAndAppendTemplate = function () {
    //SwalTemplate Addition
    var swalTemplateElement = document.createElement('template');
    swalTemplateElement.setAttribute('id', "SwalTemplate");
    var MainDiv = document.createElement('div');
    MainDiv.setAttribute('class', 'MainDiv');

    var nameElement = document.createElement('input');
    nameElement.setAttribute('class', 'nameInput swal2-input');
    nameElement.setAttribute('placeholder', 'Enter a name');
    nameElement.setAttribute('maxlength','50');

    var selectorInputElement = document.createElement('input');
    selectorInputElement.setAttribute('class', 'selectorElementInput swal2-input');
    selectorInputElement.setAttribute('placeholder', 'Optional element selector');

    var contentInputElement = document.createElement('textarea');
    contentInputElement.setAttribute('class', 'contentInput swal2-textarea');
    contentInputElement.setAttribute('placeholder', 'Enter the text for tour');
    contentInputElement.setAttribute('maxlength', '100');

    var eventTypeInputElement = document.createElement('input');
    eventTypeInputElement.setAttribute('class', 'eventTypeInput swal2-input');
    eventTypeInputElement.setAttribute('placeholder', 'Event Type During tour');

    MainDiv.appendChild(nameElement);
    MainDiv.appendChild(contentInputElement);
    MainDiv.appendChild(selectorInputElement);
    MainDiv.appendChild(eventTypeInputElement);

    swalTemplateElement.content.appendChild(MainDiv);

    document.body.appendChild(swalTemplateElement);
  };

  var fetchData = function (currentHostName) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([currentHostName], (obj) => {
        resolve(obj[currentHostName] ? JSON.parse(obj[currentHostName]) : []);
      })
    });
  };

  var addStepData=  async function(currentHostName,stepPayload){
    var allDataForHostName = await fetchData(currentHostName);
    stepPayload.stepNumber='';
    //Filter our for items with activeTourId
    for(var i=0;i<allDataForHostName.length;i++){
      var currentTourObject=allDataForHostName[i];
      if(currentTourObject.tourId===activeTourId){
        var currentTourObjectSteps=currentTourObject.tourObj.steps;
        stepPayload.stepNumber=currentTourObjectSteps.length+1;
        currentTourObject.tourObj.steps=[...currentTourObjectSteps,stepPayload];
        allDataForHostName[i]=currentTourObject;
        chrome.storage.sync.set({
          [currentHostName]: JSON.stringify(allDataForHostName)
        });
        break;
      }
    }
    console.log("Updated Data from addStepData method below for current Tour:");
    console.log(currentTourObject);
  };

  // inspector element styles
  var linkElement = document.createElement('link');
  linkElement.setAttribute('rel', 'stylesheet');
  linkElement.setAttribute('type', 'text/css');
  linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent('.inspector-element { position: absolute; pointer-events: none; border: 2px solid tomato; transition: all 200ms; background-color: rgba(180, 187, 105, 0.2); z-index:2147483644 }'));
  document.head.appendChild(linkElement);

  //Creation of Modal Template Element and appending it to body
  generateAndAppendTemplate();

  var handleEvents= async function(object,sender,sendResponse){
    var { type, payload } = object;
    var tourHostName = payload.tourObj.tourHostName;
    var allDataForHostName = await fetchData(tourHostName);
    var responseData=undefined;
    if(type==="NEW" && payload?.tourObj?.tourHostName){
      activeTourId=payload.tourId;
      responseData = [...allDataForHostName, payload];
      chrome.storage.sync.set({
        [tourHostName]: JSON.stringify(responseData)
      });
    }else if(type==="GET" && payload?.tourObj?.tourHostName){
      responseData=allDataForHostName;
    }
    sendResponse(responseData);
  };

  chrome.runtime.onMessage.addListener(function (object, sender, sendResponse) {
    // the expected message has arrived
    // ready to start inspection
    var {type,payload}=object;
    if(type==='START'){
      activeTourId=payload.tourId;
    // inspection has started
      window.theRoom.start();
    }else{
      handleEvents(object,sender,sendResponse);
      return true;
    }
  });
})();