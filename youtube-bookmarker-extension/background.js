chrome.tabs.onUpdated.addListener((tabId,tab)=>{
 if(tab.url&&tab.url.includes("youtube.com/watch")){
  const queryParameters=tab.url.split("?")[1]; 
  const urlParameters=new URLSearchParams(queryParameters);//To use this as unique id
  //The below sends the info to our Content Script
  console.log(urlParameters);
  chrome.tabs.sendMessage(tabId,{
      type:"NEW",
      videoId:urlParameters.get("v")
  });
 }
})