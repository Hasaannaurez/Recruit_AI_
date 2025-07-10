import { useState, useEffect} from 'react'

const useFetch = (url) => {
    const[data, setdata] = useState(null)
    const[isPending, setPending] = useState(true)
    const[error, seterror] = useState(null)
    useEffect(() => {
        const fetchBlogs = async()=>{
        try{
       const res= await fetch(url)
       console.log(res)
       if(!res.ok){
        throw Error("error in catching the data")
       }
       const data = await res.json();
       setdata(data);
       setPending(false);
        } catch(err){
            console.log(err.message)
            seterror(err.message);
            setPending(null);
}   
        }
    
    setTimeout(() =>{
        fetchBlogs()
      }, 1000)
  }, [url]);
 
  return { data, isPending, error}

}

export default useFetch