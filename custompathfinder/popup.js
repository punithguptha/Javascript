var toggleElementFunction = function () {
  $('.toggle').click(function (e) {
    e.preventDefault();

    var outerTourElement= e.target.parentElement.parentElement;
    var innerElement=outerTourElement.querySelector('.inner');
    if(innerElement.style.display==='none' ||innerElement.style.display===""){
      e.target.style.backgroundColor='black';
      e.target.style.color='white';
      innerElement.style.display='block';
    }else{
      e.target.style.backgroundColor='white';
      e.target.style.color='black';
      innerElement.style.display='none';
    }
  });
};


var initiateAllEventListeners=function(){
  toggleElementFunction();
  var accordionListElement=document.querySelector('.AccordionList');
  var formInputElement=document.querySelector('.TourForm');
  var createTourButton=document.querySelector('.CreateTour');
  var createTourParent=createTourButton.parentElement;
  var createTourElementButton = document.querySelector('.CreateTour');
  var cancelButton=document.querySelector('.buttonGroupForm .cancelButton');
  var saveButton=document.querySelector('.buttonGroupForm .saveButton');
  createTourElementButton.addEventListener('click',function(e){
    accordionListElement.style.display='none';
    createTourParent.style.display='none';
    formInputElement.style.display='flex';
  });

  cancelButton.addEventListener('click',function(e){
    accordionListElement.style.display='block';
    createTourParent.style.display='block';
    formInputElement.style.display='none';
  });

  // saveButton.addEventListener('click',function(e){
  //   //tour_id,tour_name,tour_description,tourUrl
  // });
}

document.addEventListener('DOMContentLoaded', function () {
  // get the cta button element
  initiateAllEventListeners();
  

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
