'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Spec { key: string; value: string; modalContent: string }
interface KeyElement { tag: string; title: string; description: string; images: string[] }

async function uploadImage(file: File, token: string): Promise<string> {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`/api/products/upload-image`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.url; // e.g. /uploads/products/filename.jpg
}

export default function EditProduct({ params }: { params: { id: string } }) {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '', slug: '', description: '',
    price: '', category: '',
    coverImage: '',
    images: [] as string[],
    inventory: '999',
    shippingDate: 'March 31st, 2026',
    isActive: true,
  });
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [keyElements, setKeyElements] = useState<KeyElement[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/api/products/admin/all?limit=200`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const product = (data.products || []).find((p: any) => p._id === params.id);
        if (!product) { setError('Product not found'); setLoading(false); return; }
        setForm({
          title: product.title || '',
          slug: product.slug || '',
          description: product.description || '',
          price: String(product.price || ''),
          category: product.category || '',
          coverImage: product.coverImage || '',
          images: product.images || [],
          inventory: String(product.inventory ?? 999),
          shippingDate: product.shippingDate || 'March 31st, 2026',
          isActive: product.isActive !== false,
        });
        setSpecs((product.specs || []).map((s: any) => ({
          key: s.key || '', value: s.value || '', modalContent: s.modalContent || '',
        })));
        setKeyElements((product.keyElements || []).map((k: any) => ({
          tag: k.tag || '', title: k.title || '', description: k.description || '', images: k.images || [],
        })));
        setLoading(false);
      })
      .catch(() => { setError('Failed to load product'); setLoading(false); });
  }, [params.id, token]);

  function setField(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploadingCover(true);
    try {
      const url = await uploadImage(file, token);
      setField('coverImage', url);
    } catch (err: any) { setError(err.message); }
    finally { setUploadingCover(false); }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !token) return;
    setUploadingGallery(true);
    try {
      const urls = await Promise.all(files.map(f => uploadImage(f, token)));
      setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
      setDirty(true);
    } catch (err: any) { setError(err.message); }
    finally { setUploadingGallery(false); }
  }

  function removeGalleryImage(i: number) {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
    setDirty(true);
  }

  function setSpec(i: number, field: keyof Spec, val: string) {
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
    setDirty(true);
  }
  function addSpec() { setSpecs(prev => [...prev, { key: '', value: '', modalContent: '' }]); setDirty(true); }
  function removeSpec(i: number) { setSpecs(prev => prev.filter((_, idx) => idx !== i)); setDirty(true); }

  function setKE(i: number, field: keyof Omit<KeyElement, 'images'>, val: string) {
    setKeyElements(prev => prev.map((k, idx) => idx === i ? { ...k, [field]: val } : k));
    setDirty(true);
  }
  function addKE() {
    setKeyElements(prev => [...prev, { tag: `Feature 0${prev.length + 1}`, title: '', description: '', images: [] }]);
    setDirty(true);
  }
  function removeKE(i: number) { setKeyElements(prev => prev.filter((_, idx) => idx !== i)); setDirty(true); }
  async function handleKEImageUpload(keIdx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length || !token) return;
    try {
      const urls = await Promise.all(files.map(f => uploadImage(f, token)));
      setKeyElements(prev => prev.map((k, idx) =>
        idx === keIdx ? { ...k, images: [...k.images, ...urls] } : k
      ));
      setDirty(true);
    } catch (err: any) { setError(err.message); }
  }
  function removeKEImage(keIdx: number, imgIdx: number) {
    setKeyElements(prev => prev.map((k, idx) =>
      idx === keIdx ? { ...k, images: k.images.filter((_, i) => i !== imgIdx) } : k
    ));
    setDirty(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = {
        title: form.title,
        slug: form.slug,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        coverImage: form.coverImage,
        images: form.images,
        inventory: parseInt(form.inventory) || 0,
        shippingDate: form.shippingDate,
        isActive: form.isActive,
        specs: specs.filter(s => s.key),
        keyElements: keyElements.filter(k => k.title),
      };
      const res = await fetch(`${API}/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setDirty(false);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#aaa' }}>Loading product...</div>;

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div style={{ fontSize: 40, marginBottom: 16, color: '#000' }}>✓</div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 ,color: '#000'}}>Product Updated</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 24 }}>
          <button onClick={() => setSuccess(false)} style={btnStyle('#111', '#fff')}>Continue Editing</button>
          <a href="/admin/products" style={btnStyle('transparent', '#111', '#ddd')}>View Products</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="ph">
        <div className="page-title">Edit: {form.title}</div>
        <a href="/admin/products" className="back-link">← Back to Products</a>
      </div>
      {dirty && (
        <div style={{ background: '#fffbeb', border: '1px solid #f59e0b', padding: '10px 16px', marginBottom: 16, fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>⚠ You have unsaved changes — click <strong>Save Changes</strong> to update the product page.</span>
        </div>
      )}
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="fg">
          {/* ── LEFT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="fc">
              <div className="fc-title">Product Information</div>
              <div className="fgrp">
                <label className="fl">Title *</label>
                <input className="fi" value={form.title} onChange={e => setField('title', e.target.value)} required />
              </div>
              <div className="fgrp">
                <label className="fl">Slug *</label>
                <input className="fi" value={form.slug} onChange={e => setField('slug', e.target.value)} required />
              </div>
              <div className="fgrp">
                <label className="fl">Description *</label>
                <textarea className="fta" value={form.description} onChange={e => setField('description', e.target.value)} required rows={4} />
              </div>
              <div className="fr2">
                <div className="fgrp">
                  <label className="fl">Price (Rs.) *</label>
                  <input className="fi" type="number" min="0" value={form.price} onChange={e => setField('price', e.target.value)} required />
                </div>
                <div className="fgrp">
                  <label className="fl">Category</label>
                  <input className="fi" value={form.category} onChange={e => setField('category', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="fc">
              <div className="fc-title">Images</div>
              <div className="fgrp">
                <label className="fl">Cover Image</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {form.coverImage
                    ? <img src={form.coverImage} style={{ width: 90, height: 90, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 90, height: 90, background: '#f0ede6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#aaa', flexShrink: 0 }}>No image</div>
                  }
                  <div style={{ flex: 1 }}>
                    <input className="fi" value={form.coverImage} onChange={e => setField('coverImage', e.target.value)} placeholder="Paste URL or upload" />
                    <input ref={coverRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleCoverUpload} />
                    <button type="button" className="upload-btn" onClick={() => coverRef.current?.click()} disabled={uploadingCover}>
                      {uploadingCover ? 'Uploading...' : 'Upload Image'}
                    </button>
                  </div>
                </div>
              </div>
              <div className="fgrp">
                <label className="fl">Center Scroll Images <span style={{ color: '#bbb', fontSize: 10, letterSpacing: 0 }}>(scroll on desktop · carousel on mobile)</span></label>
                {form.images.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                    {form.images.map((img, i) => (
                      <div key={i} style={{ position: 'relative' }}>
                        <img src={img} style={{ width: 72, height: 72, objectFit: 'cover' }} />
                        <button type="button" onClick={() => removeGalleryImage(i)} style={{ position: 'absolute', top: 2, right: 2, background: '#c0392b', color: '#fff', border: 'none', width: 18, height: 18, fontSize: 10, cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <input ref={galleryRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleGalleryUpload} />
                <button type="button" className="upload-btn" onClick={() => galleryRef.current?.click()} disabled={uploadingGallery}>
                  {uploadingGallery ? 'Uploading...' : '+ Add Images'}
                </button>
                <div className="fh">Select multiple images — they scroll vertically on desktop and appear as a swipeable carousel on mobile</div>
              </div>
            </div>

            <div className="fc">
              <div className="fc-title">Specifications</div>
              {specs.map((spec, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: 8, marginBottom: 10 }}>
                  <input className="fi" placeholder="Key" value={spec.key} onChange={e => setSpec(i, 'key', e.target.value)} />
                  <input className="fi" placeholder="Value" value={spec.value} onChange={e => setSpec(i, 'value', e.target.value)} />
                  <button type="button" onClick={() => removeSpec(i)} style={{ background: '#f5ede6', border: 'none', color: '#c0392b', cursor: 'pointer', padding: '0 10px' }}>✕</button>
                  <div style={{ gridColumn: '1/-1' }}>
                    <input className="fi" placeholder="Modal content" value={spec.modalContent} onChange={e => setSpec(i, 'modalContent', e.target.value)} />
                  </div>
                </div>
              ))}
              <button type="button" className="add-row-btn" onClick={addSpec}>+ Add Specification</button>
            </div>

            <div className="fc">
              <div className="fc-title">Key Elements / Features</div>
              {keyElements.map((ke, i) => (
                <div key={i} style={{ border: '1px solid #e8e6de', padding: 16, marginBottom: 16, position: 'relative' }}>
                  <button type="button" onClick={() => removeKE(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer', fontSize: 14 }}>✕</button>
                  <div className="fr2" style={{ marginBottom: 10 }}>
                    <div><label className="fl">Tag</label><input className="fi" value={ke.tag} onChange={e => setKE(i, 'tag', e.target.value)} /></div>
                    <div><label className="fl">Title</label><input className="fi" value={ke.title} onChange={e => setKE(i, 'title', e.target.value)} /></div>
                  </div>
                  <div className="fgrp">
                    <label className="fl">Description</label>
                    <textarea className="fta" rows={2} value={ke.description} onChange={e => setKE(i, 'description', e.target.value)} />
                  </div>
                  <div className="fgrp">
                    <label className="fl">Feature Images</label>
                    {ke.images.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        {ke.images.map((img, j) => (
                          <div key={j} style={{ position: 'relative' }}>
                            <img src={img} style={{ width: 64, height: 64, objectFit: 'cover' }} />
                            <button type="button" onClick={() => removeKEImage(i, j)} style={{ position: 'absolute', top: 2, right: 2, background: '#c0392b', color: '#fff', border: 'none', width: 16, height: 16, fontSize: 9, cursor: 'pointer' }}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label style={{ display: 'inline-block', padding: '6px 14px', background: '#f5f4f0', border: '1px solid #ddd', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer', color: '#000' }}>
                      Upload Images
                      <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handleKEImageUpload(i, e)} />
                    </label>
                  </div>
                </div>
              ))}
              <button type="button" className="add-row-btn" onClick={addKE}>+ Add Feature</button>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="fc">
              <div className="fc-title">Inventory & Shipping</div>
              <div className="fgrp">
                <label className="fl">Stock Quantity</label>
                <input className="fi" type="number" min="0" value={form.inventory} onChange={e => setField('inventory', e.target.value)} />
              </div>
              <div className="fgrp">
                <label className="fl">Estimated Shipping Date</label>
                <input className="fi" value={form.shippingDate} onChange={e => setField('shippingDate', e.target.value)} />
              </div>
            </div>
            <div className="fc">
              <div className="fc-title">Status</div>
              <div className="toggle-row">
                <div>
                  <div style={{ fontSize: 13 }}>Active</div>
                  <div style={{ fontSize: 11, color: '#aaa' }}>Visible in the store</div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={form.isActive} onChange={e => setField('isActive', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div style={{ marginTop: 20 }}>
                <button type="submit" disabled={saving} style={{ ...btnStyle(dirty ? '#c0392b' : '#111', '#fff'), width: '100%', padding: 13, transition: 'background 0.2s' }}>
                  {saving ? 'Saving...' : dirty ? 'Save Changes ●' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}

function btnStyle(bg: string, color: string, border?: string): React.CSSProperties {
  return {
    display: 'inline-block', padding: '10px 20px', background: bg, color,
    border: `1px solid ${border || bg}`, textDecoration: 'none', cursor: 'pointer',
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: 'inherit',
  };
}

const css = `
  .ph{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;}
  .page-title{font-size:20px;font-weight:600;color:#111;}
  .back-link{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#888;text-decoration:none;}
  .back-link:hover{color:#111;}
  .fg{display:grid;grid-template-columns:2fr 1fr;gap:24px;}
  .fc{background:#fff;padding:24px;}
  .fc-title{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#aaa;margin-bottom:18px;}
  .fgrp{margin-bottom:14px;}
  .fl{display:block;font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:#888;margin-bottom:5px;}
  .fi{width:100%;padding:9px 11px;border:1px solid #e0dfd8;background:#f5f4f0;font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;}
  .fi:focus{border-color:#111;background:#fff;}
  .fta{width:100%;padding:9px 11px;border:1px solid #e0dfd8;background:#f5f4f0;font-size:13px;font-family:inherit;resize:vertical;outline:none;box-sizing:border-box;}
  .fta:focus{border-color:#111;background:#fff;}
  .fh{font-size:11px;color:#aaa;margin-top:4px;}
  .fr2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .toggle-row{display:flex;align-items:center;justify-content:space-between;padding:10px 0;}
  .toggle-switch{position:relative;width:40px;height:22px;}
  .toggle-switch input{opacity:0;width:0;height:0;}
  .toggle-slider{position:absolute;cursor:pointer;inset:0;background:#ddd;border-radius:22px;transition:.2s;}
  .toggle-slider:before{content:'';position:absolute;width:16px;height:16px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:.2s;}
  input:checked+.toggle-slider{background:#111;}
  input:checked+.toggle-slider:before{transform:translateX(18px);}
  .upload-btn{margin-top:8px;padding:7px 14px;background:#f5f4f0;border:1px solid #ddd;font-size:11px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-family:inherit;}
  .upload-btn:hover{background:#e8e6de;}
  .upload-btn:disabled{opacity:.5;cursor:not-allowed;}
  .add-row-btn{padding:7px 14px;background:none;border:1px dashed #bbb;color:#666;font-size:11px;letter-spacing:1px;text-transform:uppercase;cursor:pointer;font-family:inherit;}
  .add-row-btn:hover{border-color:#111;color:#111;}
  .form-error{color:#c0392b;font-size:12px;margin-bottom:16px;padding:10px 12px;background:#fff3f3;}
  @media(max-width:900px){.fg{grid-template-columns:1fr;}}
`;
