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
    subcategory: '', // Add subcategory field
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
    voltage: '', // Add voltage field
    power_source: '', // Add power_source field
    coverage_area: '', // Add coverage_area field
    finish_type: '',
    material_type: '',
    thickness: '',
    color_options: '', // Add color_options field
    certification_info: '' // Add finish_type field
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
        subcategory: data.subcategory || '', // Add subcategory field
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
        voltage: data.voltage || '', // Add voltage field
        power_source: data.power_source || '', // Add power_source field
        coverage_area: data.coverage_area || '', // Add coverage_area field
        finish_type: data.finish_type || '', // Add finish_type field
        thickness: data.thickness || '', // Add thickness field
        color_options: data.color_options || '' // Add color_options field
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
      console.log("Fetching categories...");
      const data = await productService.getProductCategories();
      console.log("Categories data received:", data);
      
      // Force using hardcoded categories instead
      const hardcodedCategories = [
        { id: 'building-materials', name: '🧱 Building & Construction Materials' },
        { id: 'fasteners', name: '🔩 Fasteners & Fixings' },
        { id: 'tools', name: '🛠️ Tools & Equipment' },
        { id: 'plumbing', name: '🔧 Plumbing & Sanitary' },
        { id: 'electrical', name: '💡 Electrical & Lighting' },
        { id: 'paints', name: '🎨 Paints & Surface Finishing' },
        { id: 'doors-windows', name: '🚪 Doors, Windows & Accessories' },
        { id: 'furniture-fittings', name: '🪑 Furniture & Cabinet Fittings' },
        { id: 'garden', name: '🌳 Garden & Outdoor' },
        { id: 'hvac', name: '🔥 Heating, Cooling & Ventilation' },
        { id: 'safety', name: '🛡️ Safety, Security & Fire Protection' },
        { id: 'cleaning', name: '🧽 Cleaning & Maintenance' },
        { id: 'automotive', name: '🚗 Automotive Tools & Supplies' },
        { id: 'adhesives', name: '🧯 Adhesives, Sealants & Chemicals' },
        { id: 'glass', name: '🪞 Glass, Acrylic & Mirrors' },
        { id: 'interior-fixtures', name: '🪟 Blinds, Curtains & Interior Fixtures' },
        { id: 'storage', name: '📦 Packaging, Storage & Organization' },
        { id: 'industrial', name: '🧰 Industrial Supplies' },
        { id: 'miscellaneous', name: '⚙️ Miscellaneous' }
      ];
      
      // Use hardcoded categories instead of API response
      setCategories(hardcodedCategories);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Your fallback code...
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
    
    // Create FormData object for product data
    const formDataToSend = new FormData();
    
    // Handle image upload to Cloudinary first if there's an image
    let imageUrl = '';
    let imagePublicId = '';
    
    if (formData.image) {
      try {
        // Get signature from backend
        const signatureResponse = await axios.get('/api/upload/signature');
        const { signature, timestamp, cloudname, apikey } = signatureResponse.data;
        
        // Create form data for Cloudinary
        const cloudinaryData = new FormData();
        cloudinaryData.append('file', formData.image);
        cloudinaryData.append('api_key', apikey);
        cloudinaryData.append('timestamp', timestamp);
        cloudinaryData.append('signature', signature);
        cloudinaryData.append('upload_preset', 'ml_default');
        
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudname}/image/upload`,
          {
            method: 'POST',
            body: cloudinaryData,
          }
        );
        
        if (!cloudinaryResponse.ok) {
          const errorData = await cloudinaryResponse.json();
          console.error('Cloudinary error details:', errorData);
          throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
        }
        
        const cloudinaryResult = await cloudinaryResponse.json();
        imageUrl = cloudinaryResult.secure_url;
        imagePublicId = cloudinaryResult.public_id;
        console.log('Image uploaded successfully:', imageUrl);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        throw new Error('Image upload failed. Please try again or use a different image.');
      }
    }
      
      // Now add all form fields
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
      formDataToSend.append('subcategory', formData.subcategory || ''); // Add subcategory field
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
      formDataToSend.append('power_source', formData.power_source || ''); // Add power_source field
      formDataToSend.append('coverage_area', parseFloat(formData.coverage_area) || 0); // Add coverage_area field
      formDataToSend.append('finish_type', formData.finish_type || ''); // Add finish_type field
      formDataToSend.append('thickness', parseFloat(formData.thickness) || 0); // Add thickness field
      formDataToSend.append('color_options', formData.color_options || ''); // Add color_options field
      formDataToSend.append('material_type', formData.material_type || ''); // Add material_type field
      formDataToSend.append('certification_info', formData.certification_info || ''); // Add certification_info field
      
      // Add Cloudinary image info
      formDataToSend.append('image_url', imageUrl);
      formDataToSend.append('image_public_id', imagePublicId);
      
      // Add all other product fields (you can add these based on your requirements)
      // ...
      
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
      err.message || // This will show Cloudinary error messages
      `Failed to ${isEditMode ? 'update' : 'create'} product. Please try again.`
    );
    console.error('Form submission error:', err);
  } finally {
    setLoading(false);
  }
};

  const getFieldVisibility = useCallback(() => {
    const category = formData.category_id;
    const subcategory = formData.subcategory;
    
    // Default field visibility - some fields are always visible
    const baseFields = {
      // Core fields - always visible
      name: true,
      sku: true,
      price: true,
      status: true,
      description: true,
      image: true,
      category_id: true,
      
      // Optional fields - conditionally visible
      brand: false,
      specifications: false,
      cost_price: false,
      discount_percentage: false,
      tax_percentage: false,
      stock_quantity: true,
      reorder_level: false,
      reorder_quantity: false,
      storage_location: false,
      unit_of_measure: false,
      supplier_id: false,
      lead_time: false,
      purchase_date: false,
      weight: false,
      dimensions: false,
      packaging_type: false,
      expiry_date: false,
      warranty_period: false,
      barcode: false,
      tags: false,
      custom_attributes: false,
      voltage: false,
      power_source: false,
      coverage_area: false,
      finish_type: false,
      material_type: false,
      thickness: false,
      color_options: false,
      certification_info: false,
    };
    
    // If no category selected, return base fields
    if (!category) {
      return baseFields;
    }
    
    // Category-specific field visibility
    const fieldsByCategory = {
      // 🧱 Building & Construction Materials
      'building-materials': {
        brand: true,
        specifications: true, 
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        reorder_quantity: true,
        storage_location: true,
        unit_of_measure: true,
        supplier_id: true,
        weight: true,
        dimensions: true,
        material_type: true,
        warranty_period: subcategory !== 'cement' && subcategory !== 'sand',
        expiry_date: ['cement', 'concrete'].includes(subcategory),
        thickness: true,
        color_options: true,
      },
      
      // 🔩 Fasteners & Fixings
      'fasteners': {
        brand: true,
        specifications: true,
        cost_price: true,
        stock_quantity: true,
        reorder_level: true,
        reorder_quantity: true,
        storage_location: true,
        unit_of_measure: true,
        supplier_id: true,
        material_type: true,
        dimensions: true,
        weight: true,
        packaging_type: true,
        thickness: true,
        color_options: true,
      },
      
      // 🛠️ Tools & Equipment
      'tools': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        warranty_period: true,
        weight: true,
        dimensions: ['hand-tools', 'power-tools', 'pneumatic-tools'].includes(subcategory),
        barcode: true,
        tags: true,
        power_source: ['power-tools', 'pneumatic-tools'].includes(subcategory),
        voltage: subcategory === 'power-tools',
        material_type: subcategory === 'hand-tools',
        thickness: true,
        color_options: true,
      },
      
      // 🔧 Plumbing & Sanitary
      'plumbing': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        warranty_period: true,
        material_type: true,
        dimensions: true,
        weight: subcategory !== 'pipes',
        unit_of_measure: true,
        packaging_type: true,
        thickness: true,
        color_options: true,
      },
      
      // 💡 Electrical & Lighting
      'electrical': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        warranty_period: true,
        voltage: true,
        power_source: ['lighting', 'fans', 'power'].includes(subcategory),
        dimensions: subcategory !== 'wires-cables',
        weight: subcategory !== 'wires-cables',
        packaging_type: subcategory === 'wires-cables',
        unit_of_measure: subcategory === 'wires-cables',
        coverage_area: subcategory === 'lighting',
        thickness: true,
        color_options: true,
      },
      
      // 🎨 Paints & Surface Finishing
      'paints': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        expiry_date: true,
        coverage_area: true,
        finish_type: true,
        unit_of_measure: true,
        packaging_type: true,
        thickness: true,
        color_options: true,
      },
      
      // 🚪 Doors, Windows & Accessories
      'doors-windows': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        storage_location: true,
        supplier_id: true,
        warranty_period: true,
        dimensions: true,
        weight: true,
        material_type: true,
        finish_type: true,
        thickness: true,
        color_options: true,
      },
      
      // 🪑 Furniture & Cabinet Fittings
      'furniture-fittings': {
        brand: true,
        specifications: true,
        cost_price: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        dimensions: true,
        material_type: true,
        finish_type: true,
        warranty_period: true,
        thickness: true,
        color_options: true,
      },
      
      // 🌳 Garden & Outdoor
      'garden': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        warranty_period: true,
        weight: true,
        dimensions: true,
        material_type: true,
        power_source: subcategory === 'power-equipment',
        thickness: true,
        color_options: true,
      },
      
      // 🔥 Heating, Cooling & Ventilation
      'hvac': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        warranty_period: true,
        dimensions: true,
        coverage_area: true,
        voltage: true,
        power_source: true,
        unit_of_measure: subcategory === 'filters',
        thickness: true,
        color_options: true,
      },
      
      // 🛡️ Safety, Security & Fire Protection
      'safety': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        warranty_period: true,
        expiry_date: ['fire-extinguishers', 'safety-gear'].includes(subcategory),
        certification_info: true,
        material_type: subcategory === 'safety-gear',
        thickness: true,
        color_options: true,
      },
      
      // 🧽 Cleaning & Maintenance
      'cleaning': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        expiry_date: true,
        unit_of_measure: true,
        packaging_type: true,
        material_type: subcategory === 'cleaning-tools',
        thickness: true,
        color_options: true,
      },
      
      // 🚗 Automotive Tools & Supplies
      'automotive': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        unit_of_measure: true,
        warranty_period: true,
        expiry_date: ['lubricants', 'car-wash'].includes(subcategory),
        thickness: true,
        color_options: true,
      },
      
      // 🧯 Adhesives, Sealants & Chemicals
      'adhesives': {
        brand: true,
        specifications: true,
        cost_price: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        supplier_id: true,
        expiry_date: true,
        coverage_area: true,
        unit_of_measure: true,
        packaging_type: true,
        thickness: true,
        color_options: true,
      },
      
      // 🪞 Glass, Acrylic & Mirrors
      'glass': {
        brand: true,
        specifications: true,
        cost_price: true,
        stock_quantity: true,
        storage_location: true,
        supplier_id: true,
        dimensions: true,
        weight: true,
        material_type: true,
        thickness: true,
        packaging_type: true,
        color_options: true,
      },
      
      // 🪟 Blinds, Curtains & Interior Fixtures
      'interior-fixtures': {
        brand: true,
        specifications: true,
        cost_price: true,
        discount_percentage: true,
        stock_quantity: true,
        storage_location: true,
        supplier_id: true,
        dimensions: true,
        material_type: true,
        color_options: true,
        finish_type: true,
        thickness: true,
      },
      
      // 📦 Packaging, Storage & Organization
      'storage': {
        brand: true,
        specifications: true,
        cost_price: true,
        stock_quantity: true,
        reorder_level: true,
        reorder_quantity: true,
        storage_location: true,
        supplier_id: true,
        dimensions: true,
        weight: true,
        material_type: true,
        unit_of_measure: true,
        thickness: true,
        color_options: true,
      },
      
      // 🧰 Industrial Supplies
      'industrial': {
        brand: true,
        specifications: true,
        cost_price: true,
        stock_quantity: true,
        reorder_level: true,
        reorder_quantity: true,
        storage_location: true,
        supplier_id: true,
        warranty_period: true,
        dimensions: true,
        weight: true,
        unit_of_measure: true,
        material_type: true,
        custom_attributes: true,
        thickness: true,
        color_options: true,
      },
      
      // ⚙️ Miscellaneous
      'miscellaneous': {
        brand: true,
        specifications: true,
        cost_price: true,
        stock_quantity: true,
        reorder_level: true,
        storage_location: true,
        custom_attributes: true,
        tags: true,
        thickness: true,
        color_options: true,
      }
    };

    // Merge base fields with category-specific fields
    return { ...baseFields, ...(fieldsByCategory[category] || {}) };
  }, [formData.category_id, formData.subcategory]);

  // Add this before the return statement
  const fieldVisibility = getFieldVisibility();

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
            {/* Product Classification section - this should appear first */}
            <div className="form-section-header">
              <h3>Product Classification</h3>
            </div>

            {/* Category Selection - always displayed first */}
            {fieldVisibility.category_id && (
              <div className="form-group">
                <label className="form-label required-field">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Subcategory Selection - shown when category is selected */}
            {formData.category_id && (
              <div className="form-group">
                <label className="form-label">Subcategory</label>
                <select
                  name="subcategory"
                  value={formData.subcategory || ''}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Subcategory</option>
                  
                  {/* Building Materials subcategories */}
                  {formData.category_id === 'building-materials' && (
                    <>
                      <option value="cement">Cement, Sand, Gravel</option>
                      <option value="bricks">Bricks, Blocks, Paving Stones</option>
                      <option value="roofing">Roofing Sheets, Tiles</option>
                      <option value="steel">Steel Bars, Rebars</option>
                      <option value="timber">Timber, MDF, Plywood, Boards</option>
                      <option value="gypsum">Gypsum Boards & Ceiling Sheets</option>
                      <option value="concrete">Precast Concrete Products</option>
                    </>
                  )}
                  
                  {/* Fasteners subcategories */}
                  {formData.category_id === 'fasteners' && (
                    <>
                      <option value="nails-screws">Nails, Screws, Bolts, Nuts</option>
                      <option value="anchors">Rivets, Anchors, Washers</option>
                      <option value="staples">Staples, Clips, Clamps</option>
                      <option value="rods">Threaded Rods & Studs</option>
                    </>
                  )}

                  {/* Tools subcategories */}
                  {formData.category_id === 'tools' && (
                    <>
                      <option value="hand-tools">Hand Tools</option>
                      <option value="power-tools">Power Tools</option>
                      <option value="pneumatic-tools">Pneumatic Tools</option>
                      <option value="measuring-tools">Measuring Tools</option>
                      <option value="welding-tools">Welding Tools & Accessories</option>
                      <option value="cutting-tools">Cutting & Grinding Tools</option>
                      <option value="accessories">Power Tool Accessories</option>
                    </>
                  )}
                  
                  {/* Electrical subcategories */}
                  {formData.category_id === 'electrical' && (
                    <>
                      <option value="wires-cables">Electrical Wires & Cables</option>
                      <option value="switches">Switches, Sockets, Circuit Breakers</option>
                      <option value="lighting">Bulbs, Tubes, LED Fixtures</option>
                      <option value="fans">Fans, Exhausts, Ceiling Fans</option>
                      <option value="power">Inverters, UPS, Batteries</option>
                      <option value="solar">Solar Panels & Solar Accessories</option>
                      <option value="electrical-tools">Electrical Tools & Testers</option>
                    </>
                  )}
                  
                  {/* Plumbing subcategories */}
                  {formData.category_id === 'plumbing' && (
                    <>
                      <option value="pipes">Pipes, Fittings, Valves</option>
                      <option value="fixtures">Bathroom Fixtures</option>
                      <option value="water-heaters">Water Heaters</option>
                      <option value="pumps">Pumps & Accessories</option>
                    </>
                  )}
                  
                  {/* Paints subcategories */}
                  {formData.category_id === 'paints' && (
                    <>
                      <option value="interior-paint">Interior Paints</option>
                      <option value="exterior-paint">Exterior Paints</option>
                      <option value="primers">Primers & Sealers</option>
                      <option value="specialty">Specialty Paints</option>
                    </>
                  )}
                  
                  {/* Add more subcategories for other categories as needed */}
                </select>
              </div>
            )}

            {/* Basic Product Information section - comes after classification */}
            <div className="form-section-header">
              <h3>Basic Product Information</h3>
            </div>

            {fieldVisibility.name && (
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
            )}

            {fieldVisibility.sku && (
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
            )}

            {fieldVisibility.brand && (
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
            )}

            {fieldVisibility.price && (
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
            )}

            {fieldVisibility.image && (
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
            )}

            {fieldVisibility.cost_price && (
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
            )}

            {fieldVisibility.discount_percentage && (
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
            )}

            {fieldVisibility.tax_percentage && (
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
            )}

            {/* Inventory section heading only if at least one inventory field is visible */}
            {(fieldVisibility.stock_quantity || fieldVisibility.reorder_level || 
              fieldVisibility.reorder_quantity || fieldVisibility.storage_location) && (
              <div className="form-section-header">
                <h3>Inventory Information</h3>
              </div>
            )}

            {fieldVisibility.stock_quantity && (
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
            )}

            {fieldVisibility.reorder_level && (
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
            )}

            {fieldVisibility.reorder_quantity && (
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
            )}

            {fieldVisibility.storage_location && (
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
            )}

            {fieldVisibility.unit_of_measure && (
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
            )}

            {fieldVisibility.supplier_id && (
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
            )}

            {fieldVisibility.lead_time && (
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
            )}

            {fieldVisibility.purchase_date && (
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
            )}

            {fieldVisibility.status && (
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
            )}

            {fieldVisibility.expiry_date && (
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
            )}

            {fieldVisibility.warranty_period && (
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
            )}

            {fieldVisibility.voltage && (
              <div className="form-group">
                <label className="form-label">Voltage</label>
                <input
                  type="text"
                  name="voltage"
                  value={formData.voltage || ''}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., 220V, 110V"
                />
              </div>
            )}

            {fieldVisibility.material_type && (
              <div className="form-group">
                <label className="form-label">Material Type</label>
                <select
                  name="material_type"
                  value={formData.material_type || ''}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">Select Material</option>
                  <option value="steel">Steel</option>
                  <option value="aluminum">Aluminum</option>
                  <option value="wood">Wood</option>
                  <option value="plastic">Plastic</option>
                  <option value="ceramic">Ceramic</option>
                  <option value="glass">Glass</option>
                  <option value="composite">Composite</option>
                  <option value="rubber">Rubber</option>
                  <option value="concrete">Concrete</option>
                  <option value="copper">Copper</option>
                  <option value="brass">Brass</option>
                  <option value="fabric">Fabric</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}

            {fieldVisibility.thickness && (
              <div className="form-group">
                <label className="form-label">Thickness (mm)</label>
                <input
                  type="number"
                  name="thickness"
                  value={formData.thickness || ''}
                  onChange={handleChange}
                  className="form-control"
                  step="0.1"
                  min="0"
                />
              </div>
            )}

            {fieldVisibility.color_options && (
              <div className="form-group">
                <label className="form-label">Available Colors</label>
                <input
                  type="text"
                  name="color_options"
                  value={formData.color_options || ''}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., White, Black, Natural"
                />
              </div>
            )}

            {fieldVisibility.certification_info && (
              <div className="form-group">
                <label className="form-label">Safety Certification</label>
                <input
                  type="text"
                  name="certification_info"
                  value={formData.certification_info || ''}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="e.g., ISO 9001, ANSI/ISEA Z87.1-2020"
                />
              </div>
            )}

            {/* Dimensions section heading only if dimensions or weight are visible */}
            {(fieldVisibility.dimensions || fieldVisibility.weight) && (
              <div className="form-section-header">
                <h3>Physical Specifications</h3>
              </div>
            )}

            {fieldVisibility.dimensions && (
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
            )}

            {fieldVisibility.weight && (
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
            )}

            {fieldVisibility.description && (
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>
            )}

            {fieldVisibility.specifications && (
              <div className="form-group">
                <label className="form-label">Specifications</label>
                <textarea
                  name="specifications"
                  value={formData.specifications || ''}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  placeholder="Technical specifications, features, etc."
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
export default ProductForm;