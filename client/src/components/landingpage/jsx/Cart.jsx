import { FaTimes, FaShoppingBag, FaWhatsapp, FaPhone } from 'react-icons/fa';
import '../css/Cart.css';
import { memo, useCallback } from 'react';
import {
  incrementItem,
  decrementItem,
  removeFromCart,
  getCartTotal,
  buildWhatsAppURL,
  getWhatsAppNumber  // ← Import this
} from '../../../utils/CartUtil';

// ── Cart Item ──
const CartItem = memo(({ item, onIncrement, onDecrement, onRemove }) => (
  <li className="cart-item">
    <div className="cart-item__thumb">
      <img
        src={item.image || '/placeholder.jpg'}
        alt={item.name}
        loading="lazy"
      />
    </div>
    <div className="cart-item__details">
      <p className="cart-item__name">{item.name}</p>
      <p className="cart-item__unit-price">
        KES {Number(item.price).toLocaleString()} each
      </p>
      <div className="cart-item__controls">
        <button className="qty-btn" onClick={() => onDecrement(item.id)}>−</button>
        <span className="qty-value">{item.quantity}</span>
        <button className="qty-btn" onClick={() => onIncrement(item.id)}>+</button>
      </div>
    </div>
    <div className="cart-item__right">
      <p className="cart-item__line-total">
        KES {(item.price * item.quantity).toLocaleString()}
      </p>
      <button className="cart-item__remove" onClick={() => onRemove(item.id)}>
        <FaTimes />
      </button>
    </div>
  </li>
));
CartItem.displayName = 'CartItem';

// ── Cart Drawer ──
const Cart = ({ cart, setCart, isOpen, onClose }) => {
  const handleIncrement = useCallback((id) => {
    setCart(prev => incrementItem(prev, id));
  }, [setCart]);

  const handleDecrement = useCallback((id) => {
    setCart(prev => decrementItem(prev, id));
  }, [setCart]);

  const handleRemove = useCallback((id) => {
    setCart(prev => removeFromCart(prev, id));
  }, [setCart]);

  const handleCheckout = useCallback(() => {
    if (cart.length === 0) return;
    const phoneNumber = getWhatsAppNumber(); // ← Get from .env directly
    const url = buildWhatsAppURL(cart, phoneNumber);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [cart]);

  const total = getCartTotal(cart);
  const phoneNumber = getWhatsAppNumber(); // ← Get from .env

  return (
    <>
      <div
        className={`cart-backdrop ${isOpen ? 'cart-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`cart-drawer ${isOpen ? 'cart-drawer--open' : ''}`}
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
      >
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">
            Your Order
            {cart.length > 0 && <span className="cart-drawer__count">{cart.length}</span>}
          </h2>
          <button className="cart-drawer__close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="cart-drawer__body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <FaShoppingBag className="cart-empty__icon" />
              <p>No items yet.</p>
              <span>Hover a product and tap <strong>Add to Order</strong>.</span>
            </div>
          ) : (
            <ul className="cart-list">
              {cart.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                />
              ))}
            </ul>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-drawer__footer">
            <div className="cart-total">
              <span className="cart-total__label">Total</span>
              <span className="cart-total__value">
                KES {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              className="checkout-btn"
              onClick={handleCheckout}
            >
              <FaWhatsapp />
              Checkout via WhatsApp
            </button>
            <a href={`tel:${phoneNumber}`} className="call-btn">
              <FaPhone /> Call Us Directly
            </a>
          </div>
        )}
      </aside>
    </>
  );
};

export default Cart;