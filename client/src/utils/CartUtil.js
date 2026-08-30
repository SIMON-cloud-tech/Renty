// ── Add to cart ──
export const addToCart = (cart, product) => {
  const exists = cart.find(item => item.id === product.id);
  if (exists) {
    return cart.map(item =>
      item.id === product.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }
  return [...cart, { ...product, quantity: 1 }];
};

// ── Increment ──
export const incrementItem = (cart, id) =>
  cart.map(item =>
    item.id === id ? { ...item, quantity: item.quantity + 1 } : item
  );

// ── Decrement ──
export const decrementItem = (cart, id) =>
  cart
    .map(item =>
      item.id === id ? { ...item, quantity: item.quantity - 1 } : item
    )
    .filter(item => item.quantity > 0);

// ── Remove ──
export const removeFromCart = (cart, id) =>
  cart.filter(item => item.id !== id);

// ── Total ──
export const getCartTotal = (cart) =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

// ── Count ──
export const getCartCount = (cart) =>
  cart.reduce((sum, item) => sum + item.quantity, 0);

// ── Get WhatsApp Number from .env ──
export const getWhatsAppNumber = () => {
  return import.meta.env.VITE_WHATSAPP_NUMBER || '254727713219';
};

// ── WhatsApp URL ──
export const buildWhatsAppURL = (cart, phone) => {
  const now = new Date();
  const time = now.toLocaleString('en-KE', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Nairobi'
  });

  const lines = cart.map(
    (item, index) =>
      `${index + 1}. *${item.name}*\n    Qty: ${item.quantity} × KES ${item.price.toLocaleString()} = *KES ${(item.price * item.quantity).toLocaleString()}*`
  );

  const total = getCartTotal(cart);

  const message = [
    '🪑 *FurniHaven – New Furniture Order*',
    `🕐 ${time}`,
    '',
    '*Order Summary:*',
    ...lines,
    '',
    '─────────────────',
    `🧾 *Order Total: KES ${total.toLocaleString()}*`,
    '─────────────────',
    '',
    '📍 *Delivery Areas:* Nairobi, Kiambu, Machakos, Kajiado, Nakuru, Kisumu, and nationwide.',
    '',
    'Kindly confirm availability, delivery timeline, and payment details.',
    'Thank you for choosing FurniHaven! 🪑'
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};