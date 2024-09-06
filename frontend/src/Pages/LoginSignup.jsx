import React, { useState } from 'react'
import './Css/LoginSignup.css'
import { url } from '../../../urlconfig';
const LoginSignup = () => {

  const[state,setState] = useState("Login");

  const [formData,setFormData]= useState({
    username:"",
    password:"",
    email:"",
  })

  const changeHandler = (e)=>{
    
    setFormData({...formData,[e.target.name]:e.target.value})
    
  }


  const Login = async () => {
     let responseData;
     await fetch(url+'/login',{
      method:"POST",
      headers:{
        Accept:"application/json",
        "Content-Type":"application/json"
      },
      body:JSON.stringify(formData)
     }).then((res)=>res.json()).then((data)=>responseData=data)

     if(responseData.success){
      localStorage.setItem('auth-token',responseData.token);
      window.location.replace("/")
     }else{
      alert(responseData.errors)
     }
  }

  const Signup = async () => {
    // console.log("Signup Function",formData);
    let responseData;
    await fetch(url+"/signup",{
      method:"POST",
      headers:{
        Accept:"application/form-data",
        "Content-Type":"application/json",
      },
      body:JSON.stringify(formData),
    }).then((res)=>res.json()).then((data)=>{
       
      responseData=data
      // console.log(responseData); 
    })
      if(responseData.success){
        
        localStorage.setItem('auth-token',responseData.token);
        window.location.replace('/');
      }
      else{
        alert(responseData.error);
         
      }
  }


  return (
    <div className='loginsignup' >
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state==="Sign Up"?
          <input name='username' value={formData.username} onChange={changeHandler} type="text" placeholder='Your Name' />:<></>}
          <input name='email' value={formData.email} onChange={changeHandler} type="email" placeholder='Your Email Id' />
          <input name='password' value={formData.password} onChange={changeHandler} type="password" placeholder='Password' />
        </div>
        
        <button onClick={()=>{state==="Login"?Login():Signup()}}>Continue</button>
        {state==="Sign Up"?<p className="loginsignup-login">Already have an Account ? <span onClick={()=>{setState("Login")}}>Login here</span> </p>:<p className="loginsignup-login">Didn't have an Account ? 
          <span onClick={()=>{setState("Sign Up")}}> Sign Up </span> </p>}
        
        
        <div className="loginsignup-agree">
          <input type="checkbox" name='' id='' />
          <p> By continuing, I agree to the terms of use and privacy Policy</p>
        </div>
      </div> 
    </div>
  )
}

export default LoginSignup