'use client'  
''  
'import { useEffect, useState } from "react";'  
''  
'export default function WorkingPortfolio() {'  
'  const [investments, setInvestments] = useState([]);'  
'  const [loading, setLoading] = useState(true);'  
'  const [error, setError] = useState(null);'  
''  
'  useEffect(() = 
'    fetch("http://localhost:3001/api/portfolio")'  
'      .then(res = 
'      .then(data = 
'        setInvestments(data);'  
'        setLoading(false);'  
'      })'  
'      .catch(err = 
'        setError(err.message);'  
'        setLoading(false);'  
'      });'  
'  }, []);'  
''  
