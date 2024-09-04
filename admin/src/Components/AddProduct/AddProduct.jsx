import React, { useState } from 'react'
import './AddProduct.css'
import upload_area from '../../assets/upload_area.svg'



const AddProduct = () => {

  const[image, setImage] = useState(false);

  const[productDetails,setproductDetails]= useState({
    name:"",
    image:"",
    category:"women",
    new_price:"",
    old_price:""
  })
  
  const imageHandler = (e)=>{
    console.log("img" ,e.target.files);
      setImage(e.target.files[0]);
  }

  const changeHandler = (e)=>{
    setproductDetails({...productDetails,[e.target.name]:e.target.value});
  }

  // {
  //   "name":"Test Product 11",
  //   "image":"http://localhost:4000/images/product_1725191083025.jpeg",
  //   "category":"Kid",
  //   "new_price":"130",
  //   "old_price":"110"
  //   }

  const addProduct =  async () =>{
    console.log(productDetails);
    let responseData;
    let product = productDetails;

    let formData = new FormData();
    formData.append("product",image);
   
    await fetch('http://localhost:4000/upload',{
      method:'POST',
      headers:{
        Accept:'applicaton/json',
      },
        body:formData,
    }).then((resp) => resp.json()).then((data)=>{responseData=data})
    // console.log("re data ha",responseData);

    if(responseData.success){
      product.image = responseData.image_url;
      console.log(product);
      await fetch('http://localhost:4000/addproduct',{
        method:'POST',
        headers:{
          Accept:'application/json',
          'content-type':'application/json',
        },
        body:JSON.stringify(product)
      }).then((res)=>res.json()).then((data)=>{
        data.success?alert("Product Added"):alert("Failed");
      })
    }

  }

  return (
    <div className='addproduct'>
        <div className="addproduct-itemfield">
            <p>Product Title</p>
            <input value={productDetails.name} onChange={changeHandler} type="text" name='name' placeholder='Type Here ' />
        </div>
        <div className="addproduct-price">
          <div className="addproduct-itemfield">
             <p>Price</p>
             <input value={productDetails.old_price} onChange={changeHandler} type="text" name='old_price' placeholder='Type Here' />
          </div>
          <div className="addproduct-itemfield">
             <p>Offer Price</p>
             <input value={productDetails.new_price} onChange={changeHandler} type="text" name='new_price' placeholder='Type Here' />
          </div>
        </div>
        <div className="addproduct-itemfield">
          <p>Product Category</p>
          <select value={productDetails.category} onChange={changeHandler} name="category" className='addproduct-selector'>
            <option value="women">Women</option>
            <option value="men">Men</option> 
            <option value="kid">Kid</option>
          </select>
        </div>
        <div className="addproduct-itemfield">
          <label htmlFor="file-input">
            <img src={image?URL.createObjectURL(image):upload_area} className='addproduct-thumbnail-img' alt="" />
          </label>
          <input onChange={imageHandler}  type="file" name='image' id='file-input' hidden />
        </div>
        <button onClick={()=>{addProduct()}} className='addproduct-btn'>Add</button>
    </div>
  )
}

export default AddProduct