import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductList from '../components/products/ProductList';
import ProductDetail from '../components/products/ProductDetail';
import ProductForm from '../components/products/ProductForm';

const ProductsPage = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/:id" element={<ProductDetail />} />
        <Route path="/add" element={<ProductForm />} />
        <Route path="/edit/:id" element={<ProductForm />} />
        <Route path="*" element={<Navigate to="/products" replace />} />
      </Routes>
    </div>
  );
};

export default ProductsPage;