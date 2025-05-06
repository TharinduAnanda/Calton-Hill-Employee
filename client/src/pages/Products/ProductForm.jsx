import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import axios from '../../utils/axiosConfig';
import './ProductForm.css';  // Import the CSS file

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
    status: 'active',
    image: null,
    // New fields
    brand: '',
    specifications: '',
    discount_percentage: '',
    tax_percentage: '',
    reorder_quantity: '',
    storage_location: '',
    unit_of_measure: '',
    lead_time: '',
    purchase_date: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    packaging_type: '',
    expiry_date: '',
    warranty_period: '',
    barcode: '',
    tags: '',
    custom_attributes: '',
    voltage: '' // Add voltage field
  });

  // Add a state for image preview
  const [imagePreview, setImagePreview] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const fetchProductData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await productService.getProductById(id);
      setFormData({
        name: data.name || '',
        sku: data.sku || '',
        brand: data.brand || '', // Add brand field
        description: data.description || '',
        specifications: data.specifications || '', // Add specifications field
        price: data.price || '',
        cost_price: data.cost_price || '',
        discount_percentage: data.discount_percentage || '', // Add discount_percentage field
        tax_percentage: data.tax_percentage || '', // Add tax_percentage field
        category_id: data.category_id || '',
        stock_quantity: data.stock_quantity || '',
        reorder_level: data.reorder_level || '',
        reorder_quantity: data.reorder_quantity || '', // Add reorder_quantity field
        storage_location: data.storage_location || '', // Add storage_location field
        unit_of_measure: data.unit_of_measure || '', // Add unit_of_measure field
        supplier_id: data.supplier_id || '',
        lead_time: data.lead_time || '', // Add lead_time field
        purchase_date: data.purchase_date || '', // Add purchase_date field
        status: data.status || 'active',
        image: null, // We don't set the File object when fetching
        weight: data.weight || '', // Add weight field
        length: data.length || '', // Add length field
        width: data.width || '', // Add width field
        height: data.height || '', // Add height field
        packaging_type: data.packaging_type || '', // Add packaging_type field
        expiry_date: data.expiry_date || '', // Add expiry_date field
        warranty_period: data.warranty_period || '', // Add warranty_period field
        barcode: data.barcode || '', // Add barcode field
        tags: data.tags || '', // Add tags field
        custom_attributes: data.custom_attributes || '', // Add custom_attributes field
        voltage: data.voltage || '' // Add voltage field
      });
      
      // Set image preview if image exists
      if (data.image_url) {
        setImagePreview(data.image_url);
      }
      
      setError(null);
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
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Set default categories if API fails
      setCategories([
        { id: 'tools', name: 'Tools' },
        { id: 'plumbing', name: 'Plumbing' },
        { id: 'electrical', name: 'Electrical' },
        { id: 'hardware', name: 'Hardware' },
        { id: 'building-materials', name: 'Building Materials' }
      ]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      // Use axios through your axiosConfig to maintain authentication headers
      const response = await axios.get('/api/suppliers');
      
      // Handle different response formats
      let suppliersData = [];
      
      // If response is already an array
      if (Array.isArray(response)) {
        suppliersData = response;
      } 
      // If response has a data property that's an array
      else if (response && response.data && Array.isArray(response.data)) {
        suppliersData = response.data;
      } 
      // If response has a success property and data array (common API format)
      else if (response && response.data && response.data.success && Array.isArray(response.data.data)) {
        suppliersData = response.data.data;
      }
      // Ensure suppliersData is an array
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      // Set suppliers to empty array to prevent undefined errors
      setSuppliers([]);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchCategories();
      await fetchSuppliers();
      
      if (isEditMode && id) {
        await fetchProductData();
      }
    };

    fetchInitialData();
  }, [isEditMode, fetchProductData, id]);

  // Add this useEffect for cleanup
  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      if (imagePreview && !imagePreview.startsWith('http')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, or GIF)');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    // Set the file in form data
    setFormData(prev => ({
      ...prev,
      image: file
    }));
    
    // Create a preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    
    // Clear any existing errors
    setError(null);
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
      
      // Create FormData object to handle file uploads
      const formDataToSend = new FormData();
      
      // Add all text fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('brand', formData.brand); // Add brand field
      formDataToSend.append('description', formData.description);
      formDataToSend.append('specifications', formData.specifications); // Add specifications field
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('cost_price', parseFloat(formData.cost_price) || 0);
      formDataToSend.append('discount_percentage', parseFloat(formData.discount_percentage) || 0); // Add discount_percentage field
      formDataToSend.append('tax_percentage', parseFloat(formData.tax_percentage) || 0); // Add tax_percentage field
      formDataToSend.append('stock_quantity', parseInt(formData.stock_quantity));
      formDataToSend.append('reorder_level', parseInt(formData.reorder_level) || 0);
      formDataToSend.append('reorder_quantity', parseInt(formData.reorder_quantity) || 0); // Add reorder_quantity field
      formDataToSend.append('storage_location', formData.storage_location); // Add storage_location field
      formDataToSend.append('unit_of_measure', formData.unit_of_measure); // Add unit_of_measure field
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('supplier_id', formData.supplier_id);
      formDataToSend.append('lead_time', parseInt(formData.lead_time) || 0); // Add lead_time field
      formDataToSend.append('purchase_date', formData.purchase_date); // Add purchase_date field
      formDataToSend.append('status', formData.status);
      formDataToSend.append('weight', parseFloat(formData.weight) || 0); // Add weight field
      formDataToSend.append('length', parseFloat(formData.length) || 0); // Add length field
      formDataToSend.append('width', parseFloat(formData.width) || 0); // Add width field
      formDataToSend.append('height', parseFloat(formData.height) || 0); // Add height field
      formDataToSend.append('packaging_type', formData.packaging_type); // Add packaging_type field
      formDataToSend.append('expiry_date', formData.expiry_date); // Add expiry_date field
      formDataToSend.append('warranty_period', parseInt(formData.warranty_period) || 0); // Add warranty_period field
      formDataToSend.append('barcode', formData.barcode); // Add barcode field
      formDataToSend.append('tags', formData.tags); // Add tags field
      formDataToSend.append('custom_attributes', formData.custom_attributes); // Add custom_attributes field
      formDataToSend.append('voltage', formData.voltage || ''); // Add voltage field
      
      // Add image if available
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      // Update the API calls to use the FormData object
      if (isEditMode) {
        await productService.updateProduct(id, formDataToSend);
      } else {
        await productService.createProduct(formDataToSend);
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
    <div className="product-form-container">
      <div className="product-form-header">
        <h1 className="product-form-title">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
      </div>

      <div className="product-form-panel fade-in">
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required-field">Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label required-field">SKU</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Brand Name</label>
              <input
                type="text"
                name="brand"
                value={formData.brand || ''}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label required-field">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cost Price ($)</label>
              <input
                type="number"
                name="cost_price"
                value={formData.cost_price}
                onChange={handleChange}
                className="form-control"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Discount (%)</label>
              <input
                type="number"
                name="discount_percentage"
                value={formData.discount_percentage || ''}
                onChange={handleChange}
                className="form-control"
                step="0.01"
                min="0"
                max="100"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tax / VAT (%)</label>
              <input
                type="number"
                name="tax_percentage"
                value={formData.tax_percentage || ''}
                onChange={handleChange}
                className="form-control"
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label required-field">Stock Quantity</label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                className="form-control"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Level</label>
              <input
                type="number"
                name="reorder_level"
                value={formData.reorder_level}
                onChange={handleChange}
                className="form-control"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reorder Quantity</label>
              <input
                type="number"
                name="reorder_quantity"
                value={formData.reorder_quantity || ''}
                onChange={handleChange}
                className="form-control"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Storage Location</label>
              <input
                type="text"
                name="storage_location"
                value={formData.storage_location || ''}
                onChange={handleChange}
                className="form-control"
                placeholder="Warehouse A, Shelf B3, etc."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Unit of Measure</label>
              <select
                name="unit_of_measure"
                value={formData.unit_of_measure || ''}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Unit</option>
                <option value="piece">Piece</option>
                <option value="liter">Liter</option>
                <option value="kilogram">Kilogram</option>
                <option value="meter">Meter</option>
                <option value="box">Box</option>
                <option value="pair">Pair</option>
                <option value="set">Set</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Supplier</label>
              <select
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                className="form-control"
              >
                <option value="">Select Supplier</option>
                {Array.isArray(suppliers) && suppliers.map(supplier => (
                  <option 
                    key={supplier.id || supplier.Supplier_ID || supplier._id} 
                    value={supplier.id || supplier.Supplier_ID || supplier._id}
                  >
                    {supplier.name || supplier.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Lead Time (days)</label>
              <input
                type="number"
                name="lead_time"
                value={formData.lead_time || ''}
                onChange={handleChange}
                className="form-control"
                min="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                name="purchase_date"
                value={formData.purchase_date || ''}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-control"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Expiration Date</label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date || ''}
                onChange={handleChange}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Warranty Period (months)</label>
              <input
                type="number"
                name="warranty_period"
                value={formData.warranty_period || ''}
                onChange={handleChange}
                className="form-control"
                min="0"
              />
            </div>

            {formData.category_id === 'electrical' && (
              <div className="form-group">
                <label className="form-label">Voltage</label>
                <input
                  type="text"
                  name="voltage"
                  value={formData.voltage || ''}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            )}
          </div>

          <div className="form-group description-area">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              rows="4"
            ></textarea>
          </div>

          <div className="form-group specifications-area">
            <label className="form-label">Specifications</label>
            <textarea
              name="specifications"
              value={formData.specifications || ''}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Size, material, weight, color, power rating, etc."
            ></textarea>
          </div>

          <div className="form-group image-upload-container">
            <label className="form-label">Product Image</label>
            
            {imagePreview ? (
              <div className="image-preview">
                <img 
                  src={imagePreview} 
                  alt="Product Preview" 
                  className="preview-image" 
                />
                <button 
                  type="button" 
                  className="remove-image-btn"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, image: null }));
                    setImagePreview('');
                    // Reset file input
                    const fileInput = document.getElementById('product-image');
                    if (fileInput) fileInput.value = '';
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="empty-image-placeholder">
                <p>No image selected</p>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input"
              id="product-image"
            />
            <label htmlFor="product-image" className="file-input-label">
              {imagePreview ? 'Change Image' : 'Choose Image'}
            </label>
            <p className="helper-text">Recommended: JPG, PNG (Max size: 2MB)</p>
          </div>

          <div className="form-section-header">
            <h3>Logistics & Delivery</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              value={formData.weight || ''}
              onChange={handleChange}
              className="form-control"
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dimensions (LxWxH cm)</label>
            <div className="dimensions-container">
              <input
                type="number"
                name="length"
                value={formData.length || ''}
                onChange={handleChange}
                className="dimension-input"
                placeholder="L"
                step="0.1"
                min="0"
              />
              <span>x</span>
              <input
                type="number"
                name="width"
                value={formData.width || ''}
                onChange={handleChange}
                className="dimension-input"
                placeholder="W"
                step="0.1"
                min="0"
              />
              <span>x</span>
              <input
                type="number"
                name="height"
                value={formData.height || ''}
                onChange={handleChange}
                className="dimension-input"
                placeholder="H"
                step="0.1"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Packaging Type</label>
            <select
              name="packaging_type"
              value={formData.packaging_type || ''}
              onChange={handleChange}
              className="form-control"
            >
              <option value="">Select Packaging</option>
              <option value="box">Box</option>
              <option value="crate">Crate</option>
              <option value="pallet">Pallet</option>
              <option value="bag">Bag</option>
              <option value="envelope">Envelope</option>
              <option value="roll">Roll</option>
              <option value="tube">Tube</option>
              <option value="loose">Loose</option>
            </select>
          </div>

          <div className="form-section-header">
            <h3>Additional Information</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Barcode</label>
            <input
              type="text"
              name="barcode"
              value={formData.barcode || ''}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags || ''}
              onChange={handleChange}
              className="form-control"
              placeholder="hammer, tool, nail"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Custom Attributes</label>
            <textarea
              name="custom_attributes"
              value={formData.custom_attributes || ''}
              onChange={handleChange}
              className="form-control"
              rows="3"
              placeholder="Enter any additional product attributes or special information"
            ></textarea>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
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