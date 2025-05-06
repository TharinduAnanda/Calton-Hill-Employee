import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, Container } from '@mui/material';
import ProductList from './ProductList';
import ProductDetail from './ProductDetails';
import ProductForm from './ProductForm';
import './ProductsPage.css';

const ProductsPage = () => {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box className="products-container">
          <Routes>
            {/* Specific routes MUST come before generic ID route */}
            <Route path="/add" element={<ProductForm />} />
            <Route path="/edit/:id" element={<ProductForm />} />
            
            {/* Generic routes after specific routes */}
            <Route path="/:id" element={<ProductDetail />} />
            <Route path="/" element={<ProductList />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/products" replace />} />
          </Routes>
        </Box>
      </Container>
    </>
  );
};

export default ProductsPage;