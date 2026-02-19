import { useCallback, useEffect, useState } from "react";
import { getProducts } from "../../api/products.js";
import { getCustomers } from "../../api/customers.js";

function ProductCard({ product, onAdd }) {
  return (
    <div
      onClick={() => onAdd(product)}
      style={{
        background:"#fff", border:"1px solid #e5e7eb", borderRadius:8,
        padding:14, cursor:"pointer", transition:"box-shadow 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow="0 2px 12px rgba(0,0,0,0.1)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow="none"}
    >
      <div style={{ fontWeight:600, fontSize:13, marginBottom:4 }}>{product.name}</div>
      <div style={{ fontSize:11, color:"#9ca3af", marginBottom:8 }}>{product.sku}</div>
      <div style={{ fontWeight:700, color:"#18b34a" }}>${parseFloat(product.price||0).toFixed(2)}</div>
      <div style={{ fontSize:11, color: product.stock_quantity > 0 ? "#6b7280" : "#dc2626", marginTop:4 }}>
        Stock: {product.stock_quantity}
      </div>
    </div>
  );
}

export default function RetailPage() {
  const [products, setProducts]   = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch]       = useState("");
  const [cart, setCart]           = useState([]);
  const [customer, setCustomer]   = useState("");
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pr, cr] = await Promise.all([getProducts({ search }), getCustomers()]);
      setProducts(pr.data.results ?? pr.data);
      setCustomers(cr.data.results ?? cr.data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.id !== id)); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  };

  const total = cart.reduce((s, i) => s + parseFloat(i.price || 0) * i.qty, 0);

  const clearCart = () => { setCart([]); setCustomer(""); };

  return (
    <div style={{ padding:24, display:"grid", gridTemplateColumns:"1fr 360px", gap:20, height:"calc(100vh - 90px)" }}>
      {/* Product Grid */}
      <div style={{ display:"flex", flexDirection:"column", gap:12, overflow:"hidden" }}>
        <div className="page-header" style={{ marginBottom:0 }}>
          <h1>Retail / POS</h1>
        </div>
        <input
          className="search-input"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth:"none" }}
        />
        {loading
          ? <div style={{ color:"#9ca3af", textAlign:"center", marginTop:40 }}>Loading products…</div>
          : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:12, overflowY:"auto", paddingBottom:8 }}>
              {products.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
              {products.length === 0 && <div style={{ gridColumn:"1/-1", textAlign:"center", color:"#9ca3af", marginTop:32 }}>No products found</div>}
            </div>
        }
      </div>

      {/* Cart / Order Panel */}
      <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:10, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #e5e7eb", fontWeight:700, fontSize:15 }}>
          Order
        </div>

        <div style={{ padding:"12px 20px", borderBottom:"1px solid #e5e7eb" }}>
          <label style={{ fontSize:12, color:"#6b7280", display:"block", marginBottom:4 }}>Customer (optional)</label>
          <select value={customer} onChange={e=>setCustomer(e.target.value)} style={{ width:"100%", padding:"7px 10px", border:"1px solid #d1d5db", borderRadius:6, fontSize:13 }}>
            <option value="">Walk-in Customer</option>
            {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"8px 0" }}>
          {cart.length === 0
            ? <div style={{ textAlign:"center", color:"#9ca3af", padding:"32px 0", fontSize:13 }}>No items added</div>
            : cart.map(item => (
                <div key={item.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 20px", borderBottom:"1px solid #f9fafb" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:13 }}>{item.name}</div>
                    <div style={{ fontSize:11, color:"#9ca3af" }}>${parseFloat(item.price).toFixed(2)} each</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={()=>updateQty(item.id,item.qty-1)} style={{ width:24,height:24,border:"1px solid #d1d5db",borderRadius:4,background:"none",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center" }}>−</button>
                    <span style={{ minWidth:24, textAlign:"center", fontWeight:600 }}>{item.qty}</span>
                    <button onClick={()=>updateQty(item.id,item.qty+1)} style={{ width:24,height:24,border:"1px solid #d1d5db",borderRadius:4,background:"none",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center" }}>+</button>
                  </div>
                  <div style={{ fontWeight:700, fontSize:13, minWidth:60, textAlign:"right" }}>
                    ${(parseFloat(item.price)*item.qty).toFixed(2)}
                  </div>
                </div>
              ))
          }
        </div>

        <div style={{ borderTop:"1px solid #e5e7eb", padding:"16px 20px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ color:"#6b7280" }}>Subtotal</span>
            <span style={{ fontWeight:700, fontSize:16 }}>${total.toFixed(2)}</span>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button className="btn" style={{ flex:1 }} onClick={clearCart}>Clear</button>
            <button
              className="btn primary"
              style={{ flex:2 }}
              disabled={cart.length === 0}
              onClick={() => { alert(`Order placed! Total: $${total.toFixed(2)}`); clearCart(); }}
            >
              Charge ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
