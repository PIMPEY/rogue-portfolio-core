'use client';
import { useEffect, useState } from "react"; 
  
export default function TestBackend() {  
  const [data, setData] = useState(null);  
  const [loading, setLoading] = useState(true);  
  const [error, setError] = useState(null);  
  
  useEffect(() = 
    fetch("http://localhost:3001/api/portfolio")  
      .then(res = 
      .then(data = 
        setData(data);  
        setLoading(false);  
      })  
      .catch(err = 
        setError(err.message);  
        setLoading(false);  
      });  
  }, []); 
return (  
  div style={{ padding: '20px' }}  
    h1Backend Test/h1  
