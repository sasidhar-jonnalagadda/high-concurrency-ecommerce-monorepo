'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { adminApi, productApi } from '@/lib/api';
import { Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { FiPlus, FiArchive, FiRefreshCw, FiEdit2, FiX } from 'react-icons/fi';

/**
 * Admin Product Management Page.
 * Allows admins to view all products, toggle archival status, and update stock.
 * Includes a dedicated modal for creating new products.
 */
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: number | '';
    countInStock: number | '';
    image: string;
    brand: string;
    category: string;
  }>({
    name: '',
    description: '',
    price: 0,
    countInStock: 0,
    image: '',
    brand: '',
    category: '',
  });

  const fetchAllProducts = async (status = activeTab) => {
    setIsLoading(true);
    try {
      const res = await productApi.getAll(1, '', '', status);
      setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleToggleArchive = async (id: string, currentlyArchived: boolean) => {
    setIsActionLoading(id);
    try {
      await adminApi.toggleArchiveProduct(id);
      await fetchAllProducts();
    } catch {
      alert(`Failed to ${currentlyArchived ? 'restore' : 'archive'} product`);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditId(null);
    setFormData({
      name: '', description: '', price: '', countInStock: '', image: '', brand: '', category: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setIsEditing(true);
    setEditId(product.id);
    setFormData({
      name: product.name,
      description: product.description,
      price: Number(product.price),
      countInStock: product.countInStock,
      image: product.image,
      brand: product.brand,
      category: product.category,
    });
    setIsModalOpen(true);
  };

  const handleUpdateStock = async (id: string, currentStock: number) => {
    const newStock = prompt('Enter new stock quantity:', currentStock.toString());
    if (newStock === null) return;
    
    const qty = parseInt(newStock);
    if (isNaN(qty) || qty < 0) {
      alert('Invalid stock quantity');
      return;
    }

    setIsActionLoading(id);
    try {
      await adminApi.updateStock(id, qty);
      await fetchAllProducts();
    } catch {
      alert('Failed to update stock');
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Sanitize numeric inputs: Convert empty strings to 0 before submission
    const sanitizedData = {
      ...formData,
      price: formData.price === '' ? 0 : Number(formData.price),
      countInStock: formData.countInStock === '' ? 0 : Number(formData.countInStock),
    };

    try {
      if (isEditing && editId) {
        await adminApi.updateProduct(editId, sanitizedData);
      } else {
        await adminApi.createProduct(sanitizedData);
      }
      setIsModalOpen(false);
      await fetchAllProducts();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save product';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius-lg)' }} />
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Products Inventory</h2>
        <button 
          onClick={handleOpenCreate}
          className="btn btn-primary btn-sm" 
          style={{ gap: '8px' }}
        >
          <FiPlus />
          Add Product
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
        <button 
          onClick={() => { setActiveTab('active'); fetchAllProducts('active'); }}
          className={`btn btn-sm ${activeTab === 'active' ? 'btn-primary' : 'btn-ghost'}`}
        >
          Active Products
        </button>
        <button 
          onClick={() => { setActiveTab('archived'); fetchAllProducts('archived'); }}
          className={`btn btn-sm ${activeTab === 'archived' ? 'btn-danger' : 'btn-ghost'}`}
        >
          Archived Products
        </button>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-bg-elevated)', borderBottom: '1px solid var(--color-border)' }}>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>Product</th>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>Price</th>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>Stock</th>
              <th style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr 
                key={product.id} 
                style={{ 
                  borderBottom: '1px solid var(--color-border)',
                  opacity: product.isArchived ? 0.6 : 1,
                  background: product.isArchived ? 'var(--color-bg-elevated)' : 'transparent'
                }}
              >
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg)', overflow: 'hidden', position: 'relative' }}>
                      <Image src={product.image} alt={product.name} fill style={{ objectFit: 'contain' }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{product.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{product.brand}</div>
                    </div>
                    {product.isArchived && (
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>Archived</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px', fontSize: '0.875rem' }}>{product.category}</td>
                <td style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>{formatCurrency(product.price)}</td>
                <td style={{ padding: '16px' }}>
                  <button 
                    onClick={() => handleUpdateStock(product.id, product.countInStock)}
                    className="btn btn-ghost btn-sm"
                    style={{ gap: '8px', padding: '4px 8px' }}
                    disabled={isActionLoading === product.id}
                  >
                    <span style={{ 
                      fontWeight: 700, 
                      color: product.countInStock === 0 ? 'var(--color-danger)' : 'var(--color-success)' 
                    }}>
                      {product.countInStock}
                    </span>
                    <FiEdit2 size={12} />
                  </button>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {product.isArchived ? (
                      <button 
                        onClick={() => handleToggleArchive(product.id, true)}
                        className="btn btn-sm btn-primary"
                        style={{ gap: '8px' }}
                        disabled={isActionLoading === product.id}
                      >
                        {isActionLoading === product.id ? <FiRefreshCw className="spin" /> : <FiArchive />}
                        Restore
                      </button>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="btn btn-sm btn-ghost"
                          style={{ gap: '8px', border: '1px solid var(--color-border)' }}
                          disabled={isActionLoading === product.id}
                        >
                          <FiEdit2 size={14} />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleToggleArchive(product.id, false)}
                          className="btn btn-sm btn-danger"
                          style={{ gap: '8px' }}
                          disabled={isActionLoading === product.id}
                        >
                          {isActionLoading === product.id ? <FiRefreshCw className="spin" /> : <FiArchive />}
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Product Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px'
        }}>
          <div className="card animate-in" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{isEditing ? 'Update Product' : 'Create New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-ghost btn-sm">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Product Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black text-gray-900 bg-gray-50 transition-colors" 
                    placeholder="e.g. Pro X Headphones" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Brand</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black text-gray-900 bg-gray-50 transition-colors" 
                    placeholder="e.g. Sony" 
                    value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Description</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black text-gray-900 bg-gray-50 transition-colors" 
                  rows={3} placeholder="Tell us about the product..." 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Category</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black text-gray-900 bg-gray-50 transition-colors" 
                    placeholder="e.g. Electronics" 
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Image URL</label>
                  <input 
                    type="url" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black text-gray-900 bg-gray-50 transition-colors" 
                    placeholder="https://..." 
                    value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Price (₹)</label>
                  <input 
                    type="number" step="0.01" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black text-gray-900 bg-gray-50 transition-colors" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value === '' ? '' : parseFloat(e.target.value)})} 
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Initial Stock</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black text-gray-900 bg-gray-50 transition-colors" 
                    value={formData.countInStock} 
                    onChange={e => setFormData({...formData, countInStock: e.target.value === '' ? '' : parseInt(e.target.value)})} 
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
