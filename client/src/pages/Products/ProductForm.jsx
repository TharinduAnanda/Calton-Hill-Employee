import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import supplierService from '../../services/supplierService';
import axios from '../../utils/axiosConfig';
import './ProductForm.css';  // Import the CSS file
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ImageUpload from '../../components/ImageUpload'; // Import the ImageUpload component

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const dataLoadedRef = useRef(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost_price: '',
    category_id: '',
    subcategory: '',
    stock_quantity: '',
    reorder_level: '',
    supplier_id: '',
    status: 'active',
    image_url: '',
    image_public_id: '',
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
    voltage: '',
    power_source: '',
    coverage_area: '',
    finish_type: '',
    material_type: '',
    thickness: '',
    color_options: '',
    certification_info: '',
    manufacturer: '',
    optimal_level: '',
    bin_location: '',
    warehouse_zone: '',
    inventory_value_method: 'FIFO'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [setupInventory, setSetupInventory] = useState(true);

  // State for confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const fetchProductData = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      
      console.log("Raw API response:", response);
      
      const data = Array.isArray(response[0]) ? response[0][0] : response[0] || response;
      
      console.log("Processed product data:", data);
      
      console.log("Inventory data:", {
        stock_quantity: data.stock_quantity || data.Stock_Level,
        reorder_level: data.reorder_level || data.Reorder_Level,
        inventory_unit: data.inventory_unit || data.unit_of_measure
      });
      
      return data;
    } catch (error) {
      console.error("Error fetching product data:", error);
      setError("Failed to load product data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCategories = useCallback(async () => {
    try {
      console.log("Fetching categories...");
      const data = await productService.getProductCategories();
      console.log("Categories data received:", data);
      
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
      } else {
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
        setCategories(hardcodedCategories);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await supplierService.getSuppliers();
      
      let suppliersData = [];
      
      if (Array.isArray(response)) {
        suppliersData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        suppliersData = response.data;
      } else if (response && response.success && Array.isArray(response.data)) {
        suppliersData = response.data;
      }
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      
    } catch (err) {
      console.error('Failed to fetch suppliers:', err);
      setSuppliers([]);
    }
  }, []);

  useEffect(() => {
    if (dataLoadedRef.current) {
      return;
    }

    const loadData = async () => {
      try {
        await fetchCategories();
        await fetchSuppliers();
        
        if (isEditMode && id) {
          const productData = await fetchProductData();
          
          if (!productData) {
            console.error("No product data received");
            return;
          }
          
          console.log("All fields received from the server:", productData);
          
          if (categories.length > 0) {
            const productCategoryId = 
              productData.category_id || 
              productData.Category_ID || 
              (productData.Category ? productData.Category.toLowerCase().replace(/\s+/g, '-') : null);
            
            console.log("Looking for category match with ID:", productCategoryId);
            
            const matchingCategory = categories.find(cat => 
              cat.id === productCategoryId || 
              cat.name.toLowerCase() === (productData.Category || '').toLowerCase()
            );
            
            if (matchingCategory) {
              console.log("Found matching category:", matchingCategory);
              
              setFormData(prev => ({
                ...prev,
                category_id: matchingCategory.id
              }));
              
              const subcats = await productService.getSubcategories(matchingCategory.id);
              setSubcategories(subcats);
              console.log("Loaded subcategories:", subcats);
              
              const productSubcategoryId = 
                productData.subcategory_id || 
                productData.Subcategory_ID || 
                (productData.Subcategory ? productData.Subcategory.toLowerCase().replace(/\s+/g, '-') : null);
              
              console.log("Looking for subcategory match with ID:", productSubcategoryId);
              
              if (productSubcategoryId && subcats.length > 0) {
                const matchingSubcategory = subcats.find(sub => 
                  sub.id === productSubcategoryId || 
                  sub.name.toLowerCase() === (productData.Subcategory || '').toLowerCase()
                );
                
                if (matchingSubcategory) {
                  console.log("Found matching subcategory:", matchingSubcategory);
                  
                  setFormData(prev => ({
                    ...prev,
                    subcategory: matchingSubcategory.id
                  }));
                } else {
                  console.log("No matching subcategory found");
                }
              }
            }
          }
          
          setFormData(prev => ({
            ...prev,
            name: productData.Name || productData.name || '',
            sku: productData.SKU || productData.sku || '',
            description: productData.Description || productData.description || '',
            price: productData.Price?.toString() || productData.price?.toString() || '',
            cost_price: productData.cost_price?.toString() || productData.Cost_Price?.toString() || '',
            brand: productData.Brand || productData.brand || '',
            manufacturer: productData.Manufacturer || productData.manufacturer || '',
            stock_quantity: productData.stock_quantity?.toString() || productData.Stock_Level?.toString() || '0',
            reorder_level: productData.reorder_level?.toString() || productData.Reorder_Level?.toString() || '10',
            supplier_id: productData.supplier_id || productData.Supplier_ID || '',
            status: productData.Status || productData.status || 'active',
            image_url: productData.image_url || productData.Image_URL || '',
            image_public_id: productData.image_public_id || productData.Image_Public_ID || '',
            weight: productData.weight?.toString() || '',
            length: productData.length?.toString() || '',
            width: productData.width?.toString() || '',
            height: productData.height?.toString() || '',
            unit_of_measure: productData.unit_of_measure || productData.inventory_unit || '',
            material_type: productData.material_type || '',
            color_options: productData.color_options || '',
            thickness: productData.thickness?.toString() || '',
            specifications: productData.specifications || productData.specification || '',
            warranty_period: productData.warranty_period?.toString() || '',
            voltage: productData.voltage || '',
            certification_info: productData.certification_info || '',
            tax_percentage: productData.tax_percentage?.toString() || '',
            discount_percentage: productData.discount_percentage?.toString() || '',
            expiry_date: productData.expiry_date || '',
            lead_time: productData.lead_time?.toString() || ''
          }));
        }
        
        dataLoadedRef.current = true;
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load data: " + error.message);
        dataLoadedRef.current = true;
      }
    };
    
    loadData();
  }, [isEditMode, id, fetchProductData, fetchCategories, fetchSuppliers, categories]);

  // Fetch subcategories when category changes
  const fetchSubcategories = useCallback(async () => {
    if (!formData.category_id) return;
    
    try {
      console.log(`Fetching subcategories for category: ${formData.category_id}`);
      const subcategoriesData = await productService.getSubcategories(formData.category_id);
      console.log("Subcategories data received:", subcategoriesData);
      
      if (Array.isArray(subcategoriesData) && subcategoriesData.length > 0) {
        setSubcategories(subcategoriesData);
        
        // If in edit mode and we have a subcategory value from the database
        // Make sure it's correctly selected in the form
        if (isEditMode && formData.subcategory) {
          console.log("Looking for matching subcategory ID:", formData.subcategory);
          const matchingSubcategory = subcategoriesData.find(
            subcat => subcat.id === formData.subcategory || subcat.name === formData.subcategory
          );
          
          if (matchingSubcategory && matchingSubcategory.id !== formData.subcategory) {
            console.log("Found matching subcategory, updating form data:", matchingSubcategory);
            setFormData(prev => ({
              ...prev,
              subcategory: matchingSubcategory.id
            }));
          }
        }
      } else {
        // If API returns no data, we'll rely on our hardcoded subcategories in the JSX
        setSubcategories([]);
      }
    } catch (err) {
      console.error(`Failed to fetch subcategories for ${formData.category_id}:`, err);
      setSubcategories([]);
    }
  }, [formData.category_id, formData.subcategory, isEditMode, setFormData]);

  useEffect(() => {
    // Skip if we're still initializing data
    if (!dataLoadedRef.current) {
      return;
    }
    
    if (formData.category_id) {
      console.log(`Fetching subcategories for changed category: ${formData.category_id}`);
      fetchSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id, fetchSubcategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'category_id' && formData.subcategory) {
      setFormData({
        ...formData,
        [name]: value,
        subcategory: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleImageUploaded = (imageData) => {
    setFormData({
      ...formData,
      image_url: imageData.url,
      image_public_id: imageData.publicId
    });
    setError(null);
  };

  const handleImageDeleted = () => {
    setFormData({
      ...formData,
      image_url: '',
      image_public_id: ''
    });
  };

  const handleSetupInventoryChange = (e) => {
    setSetupInventory(e.target.checked);
  };

  // Safely parse float values
  const safeParseFloat = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  };

  // Safely parse integer values
  const safeParseInt = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? null : parsed;
  };

  const validateForm = () => {
    // Check required fields
    if (!formData.name) return 'Product name is required';
    if (!formData.sku) return 'SKU is required';
    
    // Validate price with stronger checking
    if (!formData.price) return 'Price is required';
    const priceValue = parseFloat(formData.price);
    if (isNaN(priceValue) || priceValue <= 0) 
      return 'Price must be a number greater than zero';
    
    // Check other numeric fields
    if (formData.cost_price) {
      const costPrice = parseFloat(formData.cost_price);
      if (isNaN(costPrice) || costPrice < 0)
        return 'Cost price must be a valid non-negative number';
    }

    if (formData.discount_percentage) {
      const discount = parseFloat(formData.discount_percentage);
      if (isNaN(discount) || discount < 0 || discount > 100)
        return 'Discount percentage must be between 0 and 100';
    }
    
    if (formData.tax_percentage) {
      const tax = parseFloat(formData.tax_percentage);
      if (isNaN(tax) || tax < 0)
        return 'Tax percentage must be a valid non-negative number';
    }

    return null; // No errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Open confirmation dialog for product updates instead of window.confirm()
    setConfirmDialog({
      open: true,
      title: isEditMode ? 'Update Product' : 'Create Product',
      message: isEditMode ? 
        "Are you sure you want to save these changes to the product?" : 
        "Are you sure you want to create this new product?",
      onConfirm: () => {
        // This function will run when the user confirms
        processFormSubmission();
      }
    });
  };
  
  // Separate the submission logic into a new function
  const processFormSubmission = async () => {
    console.log("Form submission started");

    // Validate form before submitting
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Log the form data for debugging
    console.log("Form data being submitted:", formData);
    
    // Build the product data object with ALL fields from the form
    const productData = {
      // Basic information
      name: formData.name,
      sku: formData.sku,
      description: formData.description,
      category_id: formData.category_id,
      subcategory: formData.subcategory,
      subcategory_id: formData.subcategory,
      brand: formData.brand,
      manufacturer: formData.manufacturer,
      price: safeParseFloat(formData.price) || 0, // Ensure price is never NaN
      cost_price: safeParseFloat(formData.cost_price),
      // Remove stock_level from here as it should only go to inventory table
      status: formData.status,
      
      // Image information from Cloudinary
      image_url: formData.image_url,
      image_public_id: formData.image_public_id,
      
      // Specifications
      specifications: formData.specifications || null,
      
      // Pricing and tax information
      discount_percentage: safeParseFloat(formData.discount_percentage),
      tax_percentage: safeParseFloat(formData.tax_percentage),
      
      // Physical specifications
      weight: safeParseFloat(formData.weight),
      length: safeParseFloat(formData.length),
      width: safeParseFloat(formData.width),
      height: safeParseFloat(formData.height),
      
      // Material properties
      material_type: formData.material_type || null,
      thickness: safeParseFloat(formData.thickness),
      color_options: formData.color_options || null,
      
      // Technical specifications
      voltage: formData.voltage || null,
      power_source: formData.power_source || null,
      coverage_area: formData.coverage_area || null,
      finish_type: formData.finish_type || null,
      certification_info: formData.certification_info || null,
      
      // Time-related data
      warranty_period: safeParseInt(formData.warranty_period),
      expiry_date: formData.expiry_date || null,
      lead_time: safeParseInt(formData.lead_time),
    };
    
    // Add supplier_id if it exists
    if (formData.supplier_id) {
      productData.supplier_id = formData.supplier_id;
    }
    
    console.log("Final product data being sent to API:", productData);
    
    let response;
    if (isEditMode) {
      // Update existing product
      await productService.updateProduct(id, productData);
      setSuccess("Product updated successfully");
      toast.success("Product updated successfully");
      
      // Navigate with a timestamp parameter to force refresh
      setTimeout(() => {
        navigate(`/products/${id}?updated=${Date.now()}`);
      }, 1500);
    } else {
      // Create new product
      response = await productService.createProduct(productData);
      console.log("Product created successfully:", response);
      setSuccess("Product created successfully");
      toast.success("Product created successfully");
      
      // Set up inventory if checkbox is checked
      if (setupInventory && response && response.product_id) {
        try {
          console.log("Setting up initial inventory...");
          
          // Create inventory data object with explicit type conversion
          const inventoryData = {
            product_id: response.product_id,
            stock_level: safeParseInt(formData.stock_quantity) || 0,
            reorder_level: safeParseInt(formData.reorder_level) || 10,
            optimal_level: safeParseInt(formData.optimal_level) || 50,
            supplier_id: formData.supplier_id || null,
            reorder_quantity: safeParseInt(formData.reorder_quantity) || 0,
            storage_location: formData.storage_location || null,
            unit_of_measure: formData.unit_of_measure || null,
            bin_location: formData.bin_location || null,
            warehouse_zone: formData.warehouse_zone || null,
            inventory_value_method: formData.inventory_value_method || 'FIFO',
            notes: "Initial inventory setup from product creation"
          };
          
          console.log("Inventory data:", inventoryData);
          
          // Make direct API call to create initial inventory
          const inventoryResponse = await axios.post('/api/inventory/initial', inventoryData);
          
          if (inventoryResponse && inventoryResponse.data) {
            console.log("Initial inventory created successfully:", inventoryResponse.data);
            toast.success("Initial inventory setup successful");
          }
        } catch (invError) {
          console.error("Failed to set up initial inventory:", invError);
          toast.error("Product was created, but initial inventory setup failed");
        }
      }
      
      // Navigate after creation
      try {
        setTimeout(() => {
          navigate('/products');
        }, 1500);
      } catch (navError) {
        console.error("Navigation error:", navError);
        // Provide a fallback way to navigate
        window.location.href = '/products';
      }
    }
  };

  const handleDeleteProduct = async () => {
    // First check if we have a valid ID
    if (!id) {
      console.error("Cannot delete - product ID is undefined");
      setError("Cannot delete product: ID is undefined");
      return;
    }

    console.log(`Attempting to delete product with ID: ${id}`);
    
    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Delete Product',
      message: "Are you sure you want to permanently delete this product? This action cannot be undone.",
      onConfirm: async () => {
        try {
          setLoading(true);
          await productService.deleteProduct(id);
          toast.success("Product deleted successfully");
          navigate("/products");
        } catch (err) {
          console.error(`Error deleting product #${id}:`, err);
          setError("Failed to delete product. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleDiscontinueProduct = async () => {
    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Discontinue Product',
      message: "Are you sure you want to mark this product as discontinued? This will prevent new sales of this product.",
      onConfirm: async () => {
        try {
          setLoading(true);
          // Only send the necessary fields to avoid validation errors
          const updateData = {
            status: "discontinued",
            // Include price to avoid validation errors
            price: formData.price,
            // Keep other required fields
            name: formData.name,
            sku: formData.sku
          };
          await productService.updateProduct(id, updateData);
          setFormData(prev => ({ ...prev, status: "discontinued" }));
          toast.success("Product has been marked as discontinued");
          setTimeout(() => {
            navigate(`/products/${id}`);
          }, 1500);
        } catch (err) {
          console.error("Error discontinuing product:", err);
          setError("Failed to discontinue product. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Add a new function to handle continuing selling a product
  const handleContinueSelling = async () => {
    // Show confirmation dialog
    setConfirmDialog({
      open: true,
      title: 'Continue Selling Product',
      message: "Are you sure you want to continue selling this product? This will make the product available for purchase again.",
      onConfirm: async () => {
        try {
          setLoading(true);
          // Only send the necessary fields to avoid validation errors
          const updateData = {
            status: "active",
            // Include price to avoid validation errors
            price: formData.price,
            // Keep other required fields
            name: formData.name,
            sku: formData.sku
          };
          await productService.updateProduct(id, updateData);
          setFormData(prev => ({ ...prev, status: "active" }));
          toast.success("Product has been reactivated and is now available for sale");
          setTimeout(() => {
            navigate(`/products/${id}`);
          }, 1500);
        } catch (err) {
          console.error("Error reactivating product:", err);
          setError("Failed to reactivate product. Please try again.");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getFieldVisibility = useCallback(() => {
    const category = formData.category_id;
    const subcategory = formData.subcategory;
    
    console.log(`Getting field visibility for category: ${category}, subcategory: ${subcategory}`);
    
    // In edit mode, always show fields that have data regardless of category/subcategory
    const hasData = (field) => {
      // Only consider it "has data" if it's not empty
      return isEditMode && 
        formData[field] !== undefined && 
        formData[field] !== null && 
        formData[field].toString().trim() !== '';
    };
    
    // Basic fields always visible for all categories
    const baseFields = {
      name: true,
      sku: true,
      price: true,
      status: true,
      description: true,
      image: true,
      category_id: true,
      brand: true,
      manufacturer: true,
      specifications: true,
      cost_price: true,
      stock_quantity: true,
      reorder_level: true,
      supplier_id: true,
      weight: true,
      dimensions: true,
    };

    // Category-specific fields
    const categoryFields = {
      'electrical': {
        voltage: true,
        power_source: true,
        warranty_period: true,
        certification_info: true,
        material_type: true
      },
      'plumbing': {
        material_type: true,
        thickness: true,
        color_options: true,
        warranty_period: true,
        certification_info: true
      },
      'tools': {
        warranty_period: true,
        material_type: true,
        weight: true,
        packaging_type: true,
        power_source: true
      },
      'building-materials': {
        material_type: true,
        thickness: true,
        color_options: true,
        certification_info: true,
        coverage_area: true
      },
      'fasteners': {
        material_type: true,
        thickness: true,
        finish_type: true
      },
      'paints': {
        color_options: true,
        coverage_area: true,
        finish_type: true,
        expiry_date: true
      },
      'adhesives': {
        expiry_date: true,
        material_type: true,
        certification_info: true
      },
      'garden': {
        material_type: true,
        warranty_period: true,
        power_source: true,
        color_options: true
      },
      'hvac': {
        voltage: true,
        power_source: true,
        warranty_period: true,
        certification_info: true,
        coverage_area: true
      },
      'safety': {
        certification_info: true,
        expiry_date: true,
        warranty_period: true,
        material_type: true
      }
    };

    // Subcategory-specific fields
    const subcategoryFields = {
      // Electrical subcategories
      'wiring-cables': {
        length: true,
        thickness: true,
        material_type: true,
        certification_info: true,
        finish_type: true
      },
      'switches-outlets': {
        voltage: true,
        certification_info: true,
        material_type: true,
        color_options: true
      },
      'interior-lighting': {
        voltage: true,
        power_source: true,
        color_options: true,
        warranty_period: true
      },
      
      // Plumbing subcategories
      'pipes-fittings': {
        material_type: true,
        thickness: true,
        certification_info: true,
        color_options: true
      },
      'valves-controls': {
        material_type: true,
        certification_info: true,
        warranty_period: true
      },
      
      // Tools subcategories
      'hand-tools': {
        material_type: true,
        weight: true,
        warranty_period: true
      },
      'power-tools': {
        voltage: true,
        power_source: true,
        warranty_period: true,
        certification_info: true
      }
    };

    // Start with base fields
    let visibleFields = { ...baseFields };

    // Add fields based on selected category
    if (category && categoryFields[category]) {
      visibleFields = { ...visibleFields, ...categoryFields[category] };
    }

    // Add fields based on selected subcategory
    if (subcategory && subcategoryFields[subcategory]) {
      visibleFields = { ...visibleFields, ...subcategoryFields[subcategory] };
    }

    // In edit mode, always show fields that have data, even if they aren't in the category/subcategory lists
    if (isEditMode) {
      if (hasData('discount_percentage')) visibleFields.discount_percentage = true;
      if (hasData('tax_percentage')) visibleFields.tax_percentage = true;
      if (hasData('reorder_quantity')) visibleFields.reorder_quantity = true;
      if (hasData('storage_location')) visibleFields.storage_location = true;
      if (hasData('unit_of_measure')) visibleFields.unit_of_measure = true;
      if (hasData('optimal_level')) visibleFields.optimal_level = true;
      if (hasData('lead_time')) visibleFields.lead_time = true;
      if (hasData('purchase_date')) visibleFields.purchase_date = true;
      if (hasData('packaging_type')) visibleFields.packaging_type = true;
      if (hasData('expiry_date')) visibleFields.expiry_date = true;
      if (hasData('warranty_period')) visibleFields.warranty_period = true;
      if (hasData('barcode')) visibleFields.barcode = true;
      if (hasData('tags')) visibleFields.tags = true;
      if (hasData('custom_attributes')) visibleFields.custom_attributes = true;
      if (hasData('voltage')) visibleFields.voltage = true;
      if (hasData('power_source')) visibleFields.power_source = true;
      if (hasData('coverage_area')) visibleFields.coverage_area = true;
      if (hasData('finish_type')) visibleFields.finish_type = true;
      if (hasData('material_type')) visibleFields.material_type = true;
      if (hasData('thickness')) visibleFields.thickness = true;
      if (hasData('color_options')) visibleFields.color_options = true;
      if (hasData('certification_info')) visibleFields.certification_info = true;
    }

    // Inventory fields are always important
    visibleFields.unit_of_measure = visibleFields.unit_of_measure || true;
    visibleFields.reorder_quantity = visibleFields.reorder_quantity || !isEditMode;
    visibleFields.storage_location = visibleFields.storage_location || !isEditMode;
    visibleFields.optimal_level = visibleFields.optimal_level || true;

    // Return the complete field visibility object
    return visibleFields;
  }, [isEditMode, formData]);

  const fieldVisibility = getFieldVisibility();

  if (loading && isEditMode) return <div className="text-center py-4">Loading product data...</div>;

  return (
    <div className={`product-form-container ${isEditMode ? 'edit-mode' : 'create-mode'}`}>
      {/* Confirmation Dialog */}
      <ConfirmDialog 
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          const onConfirm = confirmDialog.onConfirm;
          setConfirmDialog(prev => ({ ...prev, open: false }));
          onConfirm();
        }}
        onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
      />

      <div className="product-form-header">
        <h1 className="product-form-title">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </h1>
        {isEditMode && (
          <p className="text-muted">
            Editing product: <span className="highlight-text">{formData.name}</span> (SKU: <span className="highlight-text">{formData.sku}</span>)
          </p>
        )}
      </div>

      <div className="product-form-panel fade-in">
        {error && (
          <div className="alert alert-error">
            <i className="alert-icon">⚠️</i>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <i className="alert-icon">✅</i>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-section-header">
              <h3><span className="section-icon">🏷️</span> Product Classification</h3>
            </div>

            {fieldVisibility.category_id && (
              <div className="form-group">
                <label className="form-label required-field">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id || ''}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

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
                  {subcategories.length > 0 ? (
                    subcategories.map(subcategory => (
                      <option key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No subcategories available</option>
                  )}
                </select>
              </div>
            )}

            <div className="form-section-header">
              <h3><span className="section-icon">📋</span> Basic Product Information</h3>
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

            {fieldVisibility.manufacturer && (
              <div className="form-group">
                <label className="form-label">Manufacturer</label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer || ''}
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
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  onImageDeleted={handleImageDeleted}
                  initialImage={formData.image_url}
                  folder="products"
                  imageStyles={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain' }}
                  standardWidth={800}
                  standardHeight={800}
                  maintainAspectRatio={true}
                  showResizeToggle={true}
                />
                <p className="helper-text">Recommended: JPG, PNG (Max size: 2MB). Images will be standardized to consistent dimensions.</p>
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

            {!isEditMode && (fieldVisibility.stock_quantity || fieldVisibility.reorder_level || 
              fieldVisibility.reorder_quantity || fieldVisibility.storage_location) && (
              <div className="inventory-setup-option">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={setupInventory}
                    onChange={handleSetupInventoryChange}
                  />
                  <span className="checkmark"></span>
                  Set up initial inventory now?
                </label>
                <p className="helper-text">You can manage inventory separately after creating the product</p>
              </div>
            )}

            {(fieldVisibility.stock_quantity || fieldVisibility.reorder_level || 
              fieldVisibility.reorder_quantity || fieldVisibility.storage_location) && (
              <div className="form-section-header inventory-section">
                <h3>
                  {isEditMode ? 'Inventory Information' : 'Initial Inventory Setup'}
                </h3>
                <div className="inventory-divider">
                  <span className="inventory-divider-text">
                    {isEditMode 
                      ? 'Current inventory details (manage in Inventory section)' 
                      : 'Product and inventory are managed separately'}
                  </span>
                </div>
              </div>
            )}

            {fieldVisibility.stock_quantity && ((isEditMode) || (!isEditMode && setupInventory)) && (
              <div className="form-group">
                <label className="form-label required-field">Stock Quantity</label>
                {isEditMode ? (
                  <div className="inventory-info-box">
                    <strong>{formData.stock_quantity || 0}</strong>
                    <span className="helper-text">(Inventory is managed in Inventory section)</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    required
                  />
                )}
              </div>
            )}

            {fieldVisibility.reorder_level && ((isEditMode) || (!isEditMode && setupInventory)) && (
              <div className="form-group">
                <label className="form-label">Reorder Level</label>
                {isEditMode ? (
                  <div className="inventory-info-box">
                    <strong>{formData.reorder_level || 0}</strong>
                    <span className="helper-text">(Manage in Inventory section)</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    name="reorder_level"
                    value={formData.reorder_level}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                  />
                )}
              </div>
            )}

            {fieldVisibility.reorder_level && ((isEditMode) || (!isEditMode && setupInventory)) && (
              <div className="form-group">
                <label className="form-label">Optimal Level</label>
                {isEditMode ? (
                  <div className="inventory-info-box">
                    <strong>{formData.optimal_level || 0}</strong>
                    <span className="helper-text">(Manage in Inventory section)</span>
                  </div>
                ) : (
                  <input
                    type="number"
                    name="optimal_level"
                    value={formData.optimal_level}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                    placeholder="Default: 50"
                  />
                )}
              </div>
            )}

            {fieldVisibility.reorder_quantity && setupInventory && (
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

            {fieldVisibility.storage_location && setupInventory && (
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

          {isEditMode && (
            <div className="product-management-actions">
              <h3><span className="section-icon">⚙️</span> Product Management</h3>
              <div className="action-buttons">
                {formData.status === 'discontinued' ? (
                  <button
                    type="button"
                    className="btn btn-reactivate"
                    onClick={handleContinueSelling}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : '✅ Continue Selling This Product'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={handleDiscontinueProduct}
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : '⛔ Mark as Discontinued'}
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-delete"
                  onClick={handleDeleteProduct}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : '🗑️ Delete Product Permanently'}
                </button>
              </div>
              <p className="helper-text management-note">
                <strong>Note:</strong> Discontinuing a product keeps its history but removes it from active inventory. 
                Deleting permanently removes all product data.
              </p>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isEditMode ? '💾 Update Product' : '✨ Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default ProductForm;