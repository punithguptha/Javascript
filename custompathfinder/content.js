// configure theRoom
debugger;
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
  }
})

// inspector element styles
var linkElement = document.createElement('link')
linkElement.setAttribute('rel', 'stylesheet')
linkElement.setAttribute('type', 'text/css')
linkElement.setAttribute('href', 'data:text/css;charset=UTF-8,' + encodeURIComponent('.inspector-element { position: absolute; pointer-events: none; border: 2px solid tomato; transition: all 200ms; background-color: rgba(180, 187, 105, 0.2); z-index:2147483644 }'))
document.head.appendChild(linkElement)
debugger;
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  // the expected message has arrived
  // ready to start inspection

  // inspection has started
  debugger;
  window.theRoom.start()
})
