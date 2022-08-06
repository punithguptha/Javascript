(()=>{
    let youtubeLeftControls,youtubePlayer;
    let currentVideo="";
    let currentVideoBookmarks=[];
    
    //To Fetch all bookmarks initially
    const fetchBookmarks=()=>{
        return new Promise((resolve,reject)=>{
            chrome.storage.sync.get([currentVideo],(obj)=>{
                resolve(obj[currentVideo]?JSON.parse(obj[currentVideo]):[]);
            })
        });
    }

    chrome.runtime.onMessage.addListener((obj,sender,response)=>{
        const {type,value,videoId}=obj;
        if(type==="NEW"){
            currentVideo=videoId;
            newVideoLoaded();
        }else if(type==="PLAY"){
            youtubePlayer.currentTime=value;
        }else if(type==="DELETE"){
            currentVideoBookmarks=currentVideoBookmarks.filter((obj)=> obj.time!=value);
            chrome.storage.sync.set({[currentVideo]:JSON.stringify(currentVideoBookmarks)});
            response(currentVideoBookmarks);
        }
    });

    /*ToDo:
     To add a condition that once the function gets called it doesnot get called again on the same link
    */
    const newVideoLoaded= async ()=>{
        const bookmarkBtnExists=document.getElementsByClassName('bookmark-btn')[0];
        currentVideoBookmarks=await fetchBookmarks();
        console.log("BookmarkButtonExists: "+ bookmarkBtnExists);
        if(!bookmarkBtnExists){
            const bookmarkBtn=document.createElement("img");
            bookmarkBtn.src=chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className='ytp-buttn '+'bookmark-btn';
            bookmarkBtn.title="Click to bookmark current timestamp";
            youtubeLeftControls=document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer=document.getElementsByClassName("video-stream")[0];
            youtubeLeftControls?.appendChild(bookmarkBtn);
            if(youtubeLeftControls)
            bookmarkBtn.addEventListener("click",addNewBookmarkEventHandler);
        }
    }

    const addNewBookmarkEventHandler= async ()=>{
        const currentTime=youtubePlayer.currentTime;
        const newBookMark={
            time:currentTime,
            desc:"Bookmark at "+ getTime(currentTime)
        };
        currentVideoBookmarks=await fetchBookmarks();
        console.log("New Bookmark added: "+JSON.stringify(newBookMark));
        let combinedArray=[...currentVideoBookmarks,newBookMark];
        /*ToDo: check and remove the duplicates */
        console.log("Combined Array's length "+combinedArray.length);
        const checkFn=()=>{};
        let combinedArrayWithoutDuplicates=[];
        combinedArray.map((bookmark,index,combinedArray)=>{
            if(!combinedArrayWithoutDuplicates.find((obj) => obj.desc===bookmark.desc)){
                combinedArrayWithoutDuplicates.push(bookmark);
            }
        });
        console.log("Combined Array without duplicates below");
        console.log(combinedArrayWithoutDuplicates);
        chrome.storage.sync.set({
            /*Read about js spreads for the below syntax(https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax)
                It basically divides the input array into individual elements
                Eg., a=[1,2,3] b=[...a,4]
                b will be [1,2,3,4]*/
            [currentVideo]:JSON.stringify(combinedArrayWithoutDuplicates.sort((a,b) => a.time - b.time))
        });
    }

    const getTime=(t)=>{
        var date=new Date(0);
        date.setSeconds(t);
        return date.toISOString().substr(11,8);
    }
    //Calling the below when the page load happens edge case(since during that time the url doesnot change and background.js only sends the data on update..soo)
    newVideoLoaded();
})();