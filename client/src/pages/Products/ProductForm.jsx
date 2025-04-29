import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost_price: '',
    category_id: '',
    stock_quantity: '',
    reorder_level: '',
    supplier_id: '',
    status: 'active'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setFormData({
        name: data.name || '',
        sku: data.sku || '',
        description: data.description || '',
        price: data.price || '',
        cost_price: data.cost_price || '',
        category_id: data.category_id || '',
        stock_quantity: data.stock_quantity || '',
        reorder_level: data.reorder_level || '',
        supplier_id: data.supplier_id || '',
        status: data.status || 'active'
      });
    } catch (err) {
      setError('Failed to load product data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const data = await productService.getProductCategories();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      // Assuming you have a supplier service similar to product service
      // Replace with actual implementation
      const data = await fetch('/api/suppliers').then(res => res.json());
      setSuppliers(data);
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchCategories();
      await fetchSuppliers();
      
      if (isEditMode) {
        await fetchProductData();
      }
    };

    fetchInitialData();
  }, [isEditMode, fetchProductData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Product name is required';
    if (!formData.sku.trim()) return 'SKU is required';
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) 
      return 'Valid price is required';
    if (!formData.stock_quantity || isNaN(formData.stock_quantity) || Number(formData.stock_quantity) < 0)
      return 'Valid stock quantity is required';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const numericFormData = {
        ...formData,
        price: parseFloat(formData.price),
        cost_price: parseFloat(formData.cost_price) || 0,
        stock_quantity: parseInt(formData.stock_quantity),
        reorder_level: parseInt(formData.reorder_level) || 0
      };
      
      if (isEditMode) {
        await productService.updateProduct(id, numericFormData);
      } else {
        await productService.createProduct(numericFormData);
      }
      
      navigate('/products');
    } catch (err) {
      setError(
        err.response?.data?.message || 
        `Failed to ${isEditMode ? 'update' : 'create'} product. Please try again.`
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) return <div className="text-center py-4">Loading product data...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border rounded py-2 px-3"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full border rounded py-2 px-3"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full border rounded py-2 px-3"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Cost Price ($)</label>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                className="w-full border rounded py-2 px-3"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="w-full border rounded py-2 px-3"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Reorder Level</label>
              <input
                type="number"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleChange}
                className="w-full border rounded py-2 px-3"
                min="0"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full border rounded py-2 px-3"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Supplier</label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                className="w-full border rounded py-2 px-3"
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border rounded py-2 px-3"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block mb-2 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border rounded py-2 px-3"
              rows="4"
            ></textarea>
          </div>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;