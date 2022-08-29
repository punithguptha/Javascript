export const getCurrentTabURL= async ()=>{
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

