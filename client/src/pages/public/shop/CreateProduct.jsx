/* eslint-disable react/prop-types */

import { useFormik } from "formik"; // USE REACT HOOK FORM LATER INSTEAD
import * as Yup from "yup";
import { useState } from 'react';
import { RemoveScroll } from 'react-remove-scroll';
import { toast } from 'react-toastify'
import api from '../../../../api/axios';

export const CreateProductC = ({ isAdmin, addProduct }) => {
   const [createPopup, setCreatePopup] = useState(false);

   const formik = useFormik({
      initialValues: {
         imageUrl: "",
         name: "",
         price: ""
      },
      validationSchema: Yup.object({
         imageUrl: Yup.string()
            .min(10, 'Url must be at least 10 chars')
            .max(200, 'Url must be less than 200 chars'),
         name: Yup.string()
            .min(4, 'Name must be at least 4 chars')
            .max(50, 'Name must be less than 50 chars'),
         price: Yup.number() 
            .typeError('Price must be a valid number')
            .positive('Price must be greater than zero')
            .max(200, 'Price must be less than 200.00')
      }),
      onSubmit: async (values) => {
         try {
            const res = await api.post('/product/create', values)
            const data = res.data;

            if (data.success) {
               setCreatePopup(false)
               addProduct(data.product);
               toast.success(data.message);
               formik.resetForm()
            } 

         } catch (err) {
            console.log(err)
            toast.error(err.response)
         }
      }
   })

   const createProductPopup = (bool) => {
      setCreatePopup(bool);

      if (!bool) {
         formik.resetForm()
      }
   };

   return (
      <>
         { isAdmin && (
            <div className='admin-actions'>
               <button 
                  className='btn primary-btn primary-btn-alt admin-create-product-btn' 
                  onClick={() => createProductPopup(true)}
               >
                  Create Product
               </button>
            </div>
         )}
         { createPopup && (
            <div className="popup" onClick={() => createProductPopup(false)}>
               <RemoveScroll>
                  <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                     <h3>Create Product</h3>
                     <button className='btn close-btn' onClick={()=> createProductPopup(false)}>&#10006;</button>
                     <form className='form' onSubmit={formik.handleSubmit}>
                        <label 
                           htmlFor="imageUrl"
                           className={formik.touched.imageUrl && formik.errors.imageUrl 
                              ? "label-error" 
                              : ""
                           } 
                        >
                           {formik.touched.imageUrl && formik.errors.imageUrl 
                              ? formik.errors.imageUrl 
                              : "Image-url:"
                           }
                        </label>
                        <input 
                           type="text" 
                           className={formik.touched.imageUrl && formik.errors.imageUrl 
                              ? "input input-error" 
                              : "input"
                           }
                           onChange={formik.handleChange}
                           onBlur={formik.handleBlur} 
                           value={formik.values.imageUrl}
                           name="imageUrl"
                           id="imageUrl"
                        />
                        <label 
                           htmlFor="name"
                           className={formik.touched.name && formik.errors.name 
                              ? "label-error" 
                              : ""
                           }
                        >
                           {formik.touched.name && formik.errors.name 
                              ? formik.errors.name 
                              : "Name:"
                           }
                        </label>
                        <input 
                           type="text" 
                           className={formik.touched.name && formik.errors.name 
                              ? "input input-error" 
                              : "input"
                           }
                           onChange={formik.handleChange}
                           onBlur={formik.handleBlur} 
                           value={formik.values.name}
                           name="name"
                           id="name"
                        />
                        <label 
                           htmlFor="price"
                           className={ formik.touched.price && formik.errors.price 
                              ? "label-error" 
                              : ""
                           }
                        >
                           {formik.touched.price && formik.errors.price 
                              ? formik.errors.price 
                              : "Price:"
                           }
                        </label>
                        <input 
                           type="text" 
                           className= {formik.touched.price && formik.errors.price 
                              ? "input input-error" 
                              : "input"
                           }
                           onChange={formik.handleChange}
                           onBlur={formik.handleBlur} 
                           value={formik.values.price}
                           name="price"
                           id="price"
                        />
                        {/* later add functionality for this one */}
                        <label htmlFor="text">Quantity:</label>
                        <input 
                           type="text" 
                           value="" 
                           disabled
                        />
                        <button 
                           type="submit"
                           className='btn secondary-btn' 
                           disabled={
                              !formik.values.imageUrl || 
                              !formik.values.name || 
                              !formik.values.price
                           }
                        >
                           Create
                        </button>
                     </form>
                  </div>
               </RemoveScroll>
            </div>
         )}
      </>
   )
}
