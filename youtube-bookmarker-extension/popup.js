import { getCurrentTabURL } from "./utils.js";
// adding a new bookmark row to the popup
const addNewBookmark = (bookmarksElement,bookmark) => {
    const bookmarkTitleElement=document.createElement('div');
    const completeBookmarkElement=document.createElement('div');
    const controlsElement=document.createElement('div');

    bookmarkTitleElement.textContent=bookmark.desc;
    bookmarkTitleElement.className='bookmark-title';

    controlsElement.className='bookmark-controls';

    completeBookmarkElement.id='bookmark-'+ bookmark.time;
    completeBookmarkElement.className='bookmark';
    completeBookmarkElement.setAttribute("timestamp",bookmark.time);
    completeBookmarkElement.appendChild(bookmarkTitleElement);

    setBookmarkAttributes('play',onPlay,controlsElement);
    setBookmarkAttributes('delete',onDelete,controlsElement);

    completeBookmarkElement.appendChild(controlsElement);
    bookmarksElement.appendChild(completeBookmarkElement);
};

const viewBookmarks = (currentVideoBookmarks=[]) => {
    const bookmarksElement=document.getElementById('bookmarks');
    bookmarksElement.innerHTML="";
    if(currentVideoBookmarks.length>0){
        for(let i=0;i<currentVideoBookmarks.length;i++){
            const bookmark=currentVideoBookmarks[i];
            addNewBookmark(bookmarksElement,bookmark);
        }
    }else{
        bookmarksElement.innerHTML='<i class="row">No bookmarks to show</i>';
    }
};

const onPlay = async e => {
    const bookmarkTime=e.target.parentNode.parentNode.getAttribute('timestamp');
    console.log("OnPlay's BookmarkTime: "+bookmarkTime);
    const currentTab =await getCurrentTabURL();
    chrome.tabs.sendMessage(currentTab.id,{
        type:"PLAY",
        value:bookmarkTime
    });
};

const onDelete = async e => {
    const bookmarkTime=e.target.parentNode.parentNode.getAttribute('timestamp');
    console.log("OnDelete's BookmarkTime: "+bookmarkTime);
    const currentTab =await getCurrentTabURL();
    const bookmarkElementToDelete=document.getElementById('bookmark-'+ bookmarkTime);
    bookmarkElementToDelete.remove();
    chrome.tabs.sendMessage(currentTab.id,{
        type:'DELETE',
        value:bookmarkTime,
    },viewBookmarks);
};

const setBookmarkAttributes =  (src,eventListener,controlParentElement) => {
    const controlElement=document.createElement('img');
    controlElement.src='assets/'+src+'.png';
    controlElement.title=src;
    controlElement.addEventListener('click',eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab= await getCurrentTabURL();
    const queryParameters=activeTab.url.split("?")[1];
    const urlParameters=new URLSearchParams(queryParameters);
    const currentVideo=urlParameters.get('v');
    if(activeTab.url.includes("youtube.com/watch") && currentVideo){
        chrome.storage.sync.get([currentVideo],(data)=>{
            const currentVideoBookmarks=data[currentVideo]?JSON.parse(data[currentVideo]):[];
            viewBookmarks(currentVideoBookmarks);
        })
    }else{
        //The case where we are not on a youtube page
        let containerElement=document.getElementsByClassName('container')[0];
        containerElement.innerHTML='<div class="title">This is not a youtube page</div>';
    }
});
