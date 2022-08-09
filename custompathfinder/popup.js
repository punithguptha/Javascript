//Utils Section Start
var getCurrentTab= async ()=>{
  let queryOptions={active:true,lastFocusedWindow:true};
  /*The below is called destructuring syntax..(Read more about it here https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
  An example:
      const obj = { a: 1, b: 2 };
      const { a, b } = obj;
      // is equivalent to:
      // const a = obj.a;
      // const b = obj.b;
  */
  let [tab]=await chrome.tabs.query(queryOptions);
  return tab;
};
//Utils Section End

var toggleElementFunction = function () {
  $('.toggle').click(function (e) {
    e.preventDefault();

    var outerTourElement = e.target.parentElement.parentElement;
    var innerElementList = outerTourElement.querySelectorAll('.inner');
    if (innerElementList.length) {
      for (var i = 0; i < innerElementList.length; i++) {
        var currentInnerElement = innerElementList[i];
        if (currentInnerElement.style.display === 'none' || currentInnerElement.style.display === "") {
          e.target.style.backgroundColor = 'black';
          e.target.style.color = 'white';
          currentInnerElement.style.display = 'block';
        } else {
          e.target.style.backgroundColor = 'white';
          e.target.style.color = 'black';
          currentInnerElement.style.display = 'none';
        }
      }
    }
  });
};

var getRandomId=function(){
  return crypto.randomUUID();
}

var updateAccordionList=function(currentStorageData=[]){
  console.log("CurrentStorageData in popup.js updateAccordionList method below: ");
  console.log(currentStorageData.length);
  console.log(currentStorageData);
  var currentAccordionUlElement=document.querySelector('.AccordionList ul');
  currentAccordionUlElement.innerHTML='';
  //should auto generate the elements and append to accordion list and then show the accordion and hide the input form
  var tourElementTemplate = document.getElementById('TourElementTemplate');

  for(var i=0;i<currentStorageData.length;i++){
      var defaultTourName='Tour #'+i;
      var defaultTourDescription='Tour #'+i+" Description";
      var tourId=currentStorageData[i].tourId;
      var currTourName=currentStorageData[i].tourObj?.tourName;
      currTourName=(currTourName)?currTourName:defaultTourName;
      var currTourDescription=currentStorageData[i].tourObj?.tourDescription;
      currTourDescription=(currTourDescription)?currTourDescription:defaultTourDescription;
      var liElement=document.createElement('li');
      var tourElementCloned = tourElementTemplate.content.firstElementChild.cloneNode(true);
      tourElementCloned.querySelector('a').innerHTML=currTourName;
      tourElementCloned.querySelector('a').setAttribute('title',currTourDescription);
      tourElementCloned.querySelector('.buttonGroupOuter').setAttribute('tourId',tourId);
      liElement.appendChild(tourElementCloned);

      var steps=currentStorageData[i].tourObj?.steps;
      for(var j=0;j<steps?.length;j++){
        var defaultStepName='Step #' +j;
        var defaultStepDescription='Step #'+i+'Description';
        var currStepName=steps[j]?.stepName;
        currStepName=(currStepName)?currStepName:defaultStepName;
        var currStepDescription=steps[j]?.stepDescription;
        currStepDescription=(currStepDescription)?currStepDescription:defaultStepDescription;
        var ulElement=document.createElement('ul');
        ulElement.setAttribute('class','inner');
        var stepElementTemplate= document.getElementById('StepElementTemplate');
        var stepElementCloned=stepElementTemplate.content.firstElementChild.cloneNode(true);
        stepElementCloned.querySelector('.StepText').innerHTML=currStepName;
        stepElementCloned.querySelector('.StepElement').setAttribute('title',currStepDescription);
        ulElement.appendChild(stepElementCloned);
        liElement.appendChild(ulElement);
      }
      currentAccordionUlElement.appendChild(liElement);
  }
  var accordionListElement=document.querySelector('.AccordionList');
  var formInputElement=document.querySelector('.TourForm');
  var createTourButton=document.querySelector('.CreateTour');
  var createTourParent=createTourButton.parentElement;
  if(formInputElement.style.display==='flex'){
    accordionListElement.style.display='block';
    createTourParent.style.display='block';
    formInputElement.style.display='none';
  }
  initiateAllEventListeners();
};

var initiateAllEventListeners=async function(){
  toggleElementFunction();
  var accordionListElement=document.querySelector('.AccordionList');
  var formInputElement=document.querySelector('.TourForm');
  var createTourButton=document.querySelector('.CreateTour');
  var createTourParent=createTourButton.parentElement;
  var createTourElementButton = document.querySelector('.CreateTour');
  var cancelButton=document.querySelector('.buttonGroupForm .cancelButton');
  var saveButton=document.querySelector('.buttonGroupForm .saveButton');
  var tourNameElement=document.querySelector('.TourForm input');
  var tourDescriptionElement=document.querySelector('.TourForm textarea');

  //Add Button eventListener Binding  start
  $('.buttonGroupOuter .addButton').click(async function(e){
    var parentElement=e.target.parentElement;
    var activeTourId=parentElement.getAttribute('tourId');
    const activeTab= await getCurrentTab();
    payload={
      tourId:activeTourId
    }
    chrome.tabs.sendMessage(activeTab.id,{
      type:"START",
      payload: payload
    },updateAccordionList);
    window.close();
  });
  //Add Button eventListener Binding  end

  createTourElementButton.addEventListener('click',function(e){
    accordionListElement.style.display='none';
    createTourParent.style.display='none';
    formInputElement.style.display='flex';
  });

  cancelButton.addEventListener('click', function(e){
    accordionListElement.style.display='block';
    createTourParent.style.display='block';
    formInputElement.style.display='none';
  });

  saveButton.addEventListener('click',async function(e){
    //tourId,tourName,tourDescription,tourUrl,isActive,tourHostName
    //Make the current tour as active in the storage, such that when we send the payload from site's ui we can identify to which object we need to append to
    var tourName=tourNameElement.value;
    var tourDescription=tourDescriptionElement.value;
    var tourId=getRandomId();
    var isActive=true;
    const activeTab= await getCurrentTab();
    var urlObject=new URL(activeTab.url);
    //ToDo: To store this in hashed manner later. This will be the key of our tourObj
    var tourHostName=urlObject.hostname;
    //Storing new tour object in chrome storage by sending this info to ContentScript which adds and returns the updated info
    var payload={
      "tourId":tourId,
      "isActive":isActive,
      "tourObj":{
        "tourName":tourName,
        "tourDescription":tourDescription,
        "tourUrl":activeTab.url,
        "tourHostName":tourHostName,
        "tenantId":'7586',
        "tenantName":'shubhqa',
        'steps':[]
      }
    };
    chrome.tabs.sendMessage(activeTab.id,{
      type:"NEW",
      payload: payload
    },updateAccordionList);
  });

  
}

var generateAndAppendTemplate = function () {
  //TourElement Template Addition
  var tourElementTemplate = document.createElement('template');
  tourElementTemplate.setAttribute('id', "TourElementTemplate");
  var tourElementDiv = document.createElement('div');
  tourElementDiv.setAttribute('class', 'TourElement');
  var anchorElement = document.createElement('a');
  //To add text during runtime for this elem
  anchorElement.setAttribute('class', 'toggle');
  anchorElement.setAttribute('href', '#');
  var buttonGroup = document.createElement('div');
  buttonGroup.setAttribute('class', 'buttonGroupOuter');
  var editButtonElement0 = document.createElement('button');
  var addButtonElement0 = document.createElement('button');
  var saveButtonElement0 = document.createElement('button');
  var deleteButtonElement0 = document.createElement('button');
  editButtonElement0.innerHTML = 'E';
  editButtonElement0.setAttribute('class','editButton');
  buttonGroup.appendChild(editButtonElement0);
  addButtonElement0.innerHTML = 'A';
  addButtonElement0.setAttribute('class','addButton');
  buttonGroup.appendChild(addButtonElement0);
  saveButtonElement0.innerHTML = 'S';
  saveButtonElement0.setAttribute('class','downloadButton');
  buttonGroup.appendChild(saveButtonElement0);
  deleteButtonElement0.innerHTML = 'D';
  deleteButtonElement0.setAttribute('class','deleteButton');
  buttonGroup.appendChild(deleteButtonElement0);
  tourElementDiv.appendChild(anchorElement);
  tourElementDiv.appendChild(buttonGroup);
  tourElementTemplate.content.appendChild(tourElementDiv);
  document.body.appendChild(tourElementTemplate);

  //StepElement Template Addition
  var stepElementTemplate = document.createElement('template');
  stepElementTemplate.setAttribute('id', "StepElementTemplate");
  var listElement = document.createElement('li');
  var stepElement = document.createElement('div');
  stepElement.setAttribute('class', 'StepElement');
  var stepTextElement = document.createElement('div');
  stepTextElement.setAttribute('class', 'StepText');
  var buttonGroupInnerElement = document.createElement('div');
  buttonGroupInnerElement.setAttribute('class', 'buttonGroupInner');
  var editButtonElement = document.createElement('button');
  var saveButtonElement = document.createElement('button');
  var deleteButtonElement = document.createElement('button');
  editButtonElement.innerHTML = 'E';
  buttonGroupInnerElement.appendChild(editButtonElement);
  saveButtonElement.innerHTML = 'S';
  buttonGroupInnerElement.appendChild(saveButtonElement);
  deleteButtonElement.innerHTML = 'D';
  buttonGroupInnerElement.appendChild(deleteButtonElement);
  stepElement.appendChild(stepTextElement);
  stepElement.appendChild(buttonGroupInnerElement);
  listElement.appendChild(stepElement);
  stepElementTemplate.content.appendChild(listElement);
  document.body.appendChild(stepElementTemplate);
};

var fetchAndShow= async function(){
  const activeTab= await getCurrentTab();
  var urlObject=new URL(activeTab.url);
  //ToDo: To store this in hashed manner later. This will be the key of our tourObj
  var tourHostName=urlObject.hostname;
  chrome.tabs.sendMessage(activeTab.id,{
    type:"GET",
    payload:{
      tourObj:{
        tourHostName:tourHostName
      }
    }
  },updateAccordionList);
};

document.addEventListener('DOMContentLoaded', function () {
  // get the cta button element
  generateAndAppendTemplate();

  //Fetch and show the data during startload
  fetchAndShow();

  // handle cta button click event
  // to be able to start inspection
  // selectElementButton.addEventListener('click', function () {

  //   // send the message to start inspection
  //   chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
  //     chrome.tabs.sendMessage(tabs[0].id, {data: null})
  //   })

  //   // close the extension popup
  //   window.close()

  // }, false)
}, false)
