import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import { FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductData = useCallback(async () => {
    try {
      setLoading(true);
      // Check for special paths that should not be treated as IDs
      if (id === 'add' || id === 'edit') {
        throw new Error('Invalid product ID');
      }
      const data = await productService.getProductById(id);
      setProduct(data);
      setError(null);
    } catch (err) {
      setError('Failed to load product data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        navigate('/products');
      } catch (err) {
        setError('Failed to delete product. Please try again.');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="text-center py-4">Loading product details...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!product) return <div className="text-center py-4">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Link to="/products" className="flex items-center text-blue-500 hover:text-blue-700">
          <FaArrowLeft className="mr-2" /> Back to Products
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <div className="flex space-x-2">
            <Link
              to={`/products/edit/${product.id}`}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center"
            >
              <FaEdit className="mr-2" /> Edit
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded flex items-center"
            >
              <FaTrash className="mr-2" /> Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-2">Product Information</h2>
              <div className="border rounded divide-y">
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">SKU</div>
                  <div className="w-2/3">{product.sku}</div>
                </div>
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">Category</div>
                  <div className="w-2/3">{product.category || 'N/A'}</div>
                </div>
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">Status</div>
                  <div className="w-2/3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : product.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status?.charAt(0).toUpperCase() + product.status?.slice(1) || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">Description</div>
                  <div className="w-2/3">{product.description || 'No description provided'}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-2">Inventory Information</h2>
              <div className="border rounded divide-y">
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">Price</div>
                  <div className="w-2/3">${parseFloat(product.price).toFixed(2)}</div>
                </div>
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">Cost Price</div>
                  <div className="w-2/3">
                    {product.cost_price ? `$${parseFloat(product.cost_price).toFixed(2)}` : 'N/A'}
                  </div>
                </div>
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">Profit Margin</div>
                  <div className="w-2/3">
                    {product.cost_price ? (
                      `${(((product.price - product.cost_price) / product.price) * 100).toFixed(2)}%`
                    ) : 'N/A'}
                  </div>
                </div>
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">Current Stock</div>
                  <div className="w-2/3">
                    <span className={product.stock_quantity <= product.reorder_level ? 'text-red-600 font-medium' : ''}>
                      {product.stock_quantity}
                    </span>
                    {product.stock_quantity <= product.reorder_level && (
                      <span className="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                        Low Stock
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">Reorder Level</div>
                  <div className="w-2/3">{product.reorder_level || 'Not set'}</div>
                </div>
                <div className="flex py-2 px-3">
                  <div className="w-1/3 font-medium">Supplier</div>
                  <div className="w-2/3">{product.supplier_name || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Inventory History</h2>
          {/* This could be expanded to show actual inventory history in a future version */}
          <div className="text-gray-500 italic">
            Inventory history feature coming soon...
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;