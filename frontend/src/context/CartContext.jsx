import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // cartKey uniquely identifies a product+variant combination
  const getCartKey = (product) => {
    const variantImg = product.selectedImage || product.image || '';
    return `${product.id}__${variantImg}`;
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const key = getCartKey(product);
      const existing = prev.find(item => getCartKey(item) === key);
      if (existing) {
        return prev.map(item =>
          getCartKey(item) === key
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      // Ensure cartItemId is set for unique identification
      return [...prev, { ...product, quantity, _cartKey: key }];
    });
  };

  const removeFromCart = (cartKey) => {
    setCartItems(prev => prev.filter(item => getCartKey(item) !== cartKey));
  };

  const updateQuantity = (cartKey, quantity) => {
    setCartItems(prev =>
      prev.map(item => getCartKey(item) === cartKey ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, setCartItems, getCartKey }}>
      {children}
    </CartContext.Provider>
  );
};
