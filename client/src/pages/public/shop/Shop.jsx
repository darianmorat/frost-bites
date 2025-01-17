/* eslint-disable react/prop-types */

import { useState, useEffect } from 'react';
import { motion } from "motion/react"
import { toast } from 'react-toastify'
import api from '../../../../api/axios';

// Move components to index.jsx
import { CreateProduct } from '../../../components/adminActions/CreateProduct'
import { EditProduct } from '../../../components/adminActions/EditProduct'
import { DeleteProduct } from '../../../components/adminActions/DeleteProduct';
import { CartSection } from '../../../components/cart/CartSection'

import './shop.css'

// USE REACT MODAL FOR POPUPS

export const Shop = ({ isAdmin }) => {

   const [products, setProducts] = useState([]);
   const [deletePopup, setDeletePopup] = useState(null)
   const [editPopup, setEditPopup] = useState(null);
   const [activeBtn, setActiveBtn] = useState('explore');

   const toggleActive = (button) => {
      setActiveBtn(button);
   }

   const getProducts = async () => {
      try {
         const res = await api.get('/product');
         const data = res.data;

         setProducts(data.products);

      } catch (err) {
         console.error(err);
         toast.error(err.response.data.message)
      }
   }

   useEffect(() => {
      getProducts(); 
   }, []);

   const addProductToList = (newProduct) => {
      setProducts(prevProducts => [...prevProducts, newProduct]);
   };

   // ADD PRODUCT TO CART 
   const [cartItems, setCartItems] = useState([]);

   const addToCart = (productName, productPrice) => {
      setCartItems(prevCartItems => {
         const existingProduct = prevCartItems.find(item => item.name === productName)

         if(existingProduct){
            return prevCartItems.map(item =>
               item.name === productName 
                  ? { ...item, price:productPrice, quantity: item.quantity + 1 } 
                  : item
            )
         } else {
            return [...prevCartItems, { name: productName, price: productPrice, quantity: 1 }]
         }
      })
   }

   const removeFromCart = (productName) => {
      setCartItems(prevCartItems => {
         const existingProduct = prevCartItems.find(item => item.name === productName)

         if(existingProduct){
            return prevCartItems
               .map(item =>
                  item.name === productName 
                     ? (item.quantity > 1 ? { ...item,  quantity: item.quantity - 1 } : null) 
                     : item
               )
               .filter(item => item !== null)
         } else {
            return [...prevCartItems]
         }
      })
   }

   const totalPrice = cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity)
   }, 0).toFixed(2)

   // PRODUCT ACTIONS 
   const ProductActions = ({ productName, productPrice, cartItems, addToCart, removeFromCart }) => {

      const cartItem = cartItems.find((item) => item.name === productName)
      const quantity = cartItem ? cartItem.quantity : 0

      return (
         <div className='product-actions'>
            <button 
               className={cartItem ? 'btn add-btn' : 'btn add-btn no-items'} 
               onClick={() => addToCart(productName, productPrice)}
            >
               +
            </button>
            <p className='quantity'>{quantity}</p>
            <button 
               className={cartItem ? 'btn remove-btn' : 'btn remove-btn no-items'} 
               onClick={() => removeFromCart(productName)}
            >
               -
            </button>
         </div>
      )
   }

   return (
      <div className='shop-page'>
         <motion.div 
            initial={{ opacity: 0, x: -100 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 100 }} 
            transition={{ duration: 0.7 }}
         >
            <div className='shop-container'>
               <div className='right-section'>
                  <div className='buttons-section'>
                     <button 
                        className={`explore-btn btn ${activeBtn === 'explore' ? 'active' : 'inactive'}`}
                        onClick={() => toggleActive('explore')}
                     > 
                        EXPLORE ICE CREAM CATALOG 
                     </button>
                     <button 
                        className={`make-btn btn ${activeBtn === 'make' ? 'active' : 'inactive'}`}
                        onClick={() => toggleActive('make')}
                     > 
                        MAKE YOUR OWN ICE CREAM!
                     </button>
                  </div>

                  {activeBtn === 'explore' && 
                     <div className="product-list">
                        { products.length === 0
                           ? 
                           <div className='no-product-available'>
                              <p>It seems like there&apos;s no products available</p>

                              <CreateProduct 
                                 addProduct={addProductToList} 
                                 isAdmin={isAdmin}
                              />
                           </div>
                           :
                           <>
                              { products.map((product) => (
                                 <div key={product.product_id} className="product-item">
                                    <img
                                       src={product.product_img}
                                       alt={product.product_name}
                                       className="product-img"
                                    />
                                    <p className='product-price'> ${product.product_price} USD</p>
                                    <h2 className='product-name'> {product.product_name}</h2>

                                    {!isAdmin && 
                                       <ProductActions
                                          productName={product.product_name}
                                          productPrice={product.product_price}
                                          cartItems={cartItems}
                                          addToCart={addToCart}
                                          removeFromCart={removeFromCart}
                                       />
                                    }

                                    {isAdmin &&
                                       <>
                                          <div className='admin-actions'>
                                             <button 
                                                className='btn admin-edit-btn secondary-btn' 
                                                onClick={ () => { setEditPopup(product.product_id) }}
                                             >
                                                Edit
                                             </button>
                                             <button 
                                                className='btn logout-btn admin-delete-btn' 
                                                onClick={() => setDeletePopup(product.product_id)}
                                             >
                                                Remove
                                             </button>
                                          </div>
                                       </>
                                    }

                                    <EditProduct 
                                       editPopup={editPopup}
                                       setEditPopup={setEditPopup}
                                       getProducts={getProducts}
                                       productId={product.product_id}
                                       productImg={product.product_img}
                                       productName={product.product_name}
                                       productPrice={product.product_price}
                                    />
                                    <DeleteProduct 
                                       deletePopup={deletePopup}
                                       setDeletePopup={setDeletePopup}
                                       products={products}
                                       setProducts={setProducts}
                                       productId={product.product_id}
                                       productName={product.product_name}
                                    /> 
                                 </div>
                              ))}

                              <CreateProduct 
                                 isAdmin={isAdmin}
                                 addProduct={addProductToList} 
                              />
                           </>
                        }
                     </div>
                  }

                  {activeBtn === 'make' && 
                     <div className='product-list make'>
                        <p>IN PROGRESS</p>
                     </div>
                  }
               </div>

               {!isAdmin &&
                  <CartSection cartItems={cartItems} totalPrice={totalPrice}/>
               }
            </div>

         </motion.div>
      </div>
   )
}
