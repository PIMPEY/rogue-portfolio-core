'use client';
import { useEffect, useState } from "react"; 
  
export default function MinimalTest() {  
  const [data, setData] = useState(null);  
  const [error, setError] = useState(null);  
  
  useEffect(() = 
    fetch("http://localhost:3001/api/portfolio")  
      .then(r = 
      .then(setData)  
      .catch(setError);  
  }, []);  
  
  return (  
    div  
      h1Minimal Test/h1  
