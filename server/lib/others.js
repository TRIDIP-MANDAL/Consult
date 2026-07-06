const purifyObject = (obj)=>{
   Object.keys(obj).forEach((key)=>{
    if(obj[key] === "") delete obj[key];
 })
}

export {purifyObject};