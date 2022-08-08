// configure theRoom
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
    console.log("Inside keydown function in content.js");
    console.log("Element Selected"+getSelector(element));
    var swalTemplateElement=document.getElementById('SwalTemplate');
    var swalTemplateContentCloned=swalTemplateElement.content.firstElementChild.cloneNode(true);
    Swal.fire({
        html:swalTemplateContentCloned,
        showCloseButton: true,
        allowOutsideClick: false,
        allowEscapeKey: false,
        confirmButtonText: 'Save',
        willOpen:function(element){
          window.theRoom.stop(true);
          var o9SplitViewElement=document.getElementById('__splitview__');
          if(o9SplitViewElement){
            o9SplitViewElement.style.position='fixed';
          }
        },
        willClose:function(element){
          var o9SplitViewElement=document.getElementById('__splitview__');
          if(o9SplitViewElement){
            o9SplitViewElement.style.position='';
          }
        },
        preConfirm:function(){
          //To get the element's input values and storing them before swal closes by confirm button
        }
    }).then(function(result){
      window.theRoom.start();
    });

    // so far so good
    // stop inspection
    // window.theRoom.stop(true);
  }
})

var generateAndAppendTemplate = function () {
    var swalTemplateElement = document.createElement('template');
    swalTemplateElement.setAttribute('id', "SwalTemplate");
    var MainDiv = document.createElement('div');
    MainDiv.setAttribute('class', 'MainDiv');

    var nameElement = document.createElement('input');
    nameElement.setAttribute('class', 'nameInput swal2-input');
    nameElement.setAttribute('placeholder', 'Enter a name');

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
    MainDiv.appendChild(selectorInputElement);
    MainDiv.appendChild(contentInputElement);
    MainDiv.appendChild(eventTypeInputElement);

    swalTemplateElement.content.appendChild(MainDiv);

    document.body.appendChild(swalTemplateElement);
};

// inspector element styles
var linkElement = document.createElement('link');
linkElement.setAttribute('rel', 'stylesheet');
linkElement.setAttribute('type', 'text/css');
linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent('.inspector-element { position: absolute; pointer-events: none; border: 2px solid tomato; transition: all 200ms; background-color: rgba(180, 187, 105, 0.2); z-index:2147483644 }'));
document.head.appendChild(linkElement);

//Creation of Modal Template Element and appending it to body
generateAndAppendTemplate();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // the expected message has arrived
  // ready to start inspection

  // inspection has started
  window.theRoom.start()
});