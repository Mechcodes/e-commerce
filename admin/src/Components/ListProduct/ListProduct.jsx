import React, { useEffect, useState } from "react";
import "./ListProduct.css";
import cross_icon from "../../assets/cross_icon.png";

export const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  const fetchData = async () => {
    await fetch("http://localhost:4000/allproduct")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
      });

    // console.log({allproducts});
  };
  useEffect(() => {
    fetchData();
  }, []);

  const removeProduct = async (id) => {
    await fetch("http://localhost:4000/removeproduct",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    await fetchData();
  };

  return (
    <div className="list-product">
      <h1>All Product List</h1>
      <div className="listproduct-format-main">
        <p>Product</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {allproducts.map((product, index) => {
          return (
            <>
              <div
                key={index}
                className="listproduct-format-main listproduct-format"
              >
                <img
                  src={product.image}
                  alt="Product Image"
                  className="listproduct-product-icon"
                />
                <p>{product.name}</p>
                <p>₹ {product.old_price}</p>
                <p>₹ {product.new_price}</p>
                <p>{product.category}</p>
                <img
                  onClick={() => {
                    removeProduct(product.id);
                  }}
                  src={cross_icon}
                  alt="Cross icon"
                  className="listproduct-remove "
                />
              </div>
              <hr />
            </>
          );
        })}
        ;
      </div>
    </div>
  );
};
