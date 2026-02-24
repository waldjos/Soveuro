/// IDs de productos/suscripciones IAP (configurables; en producción pueden venir de env).
const Set<String> kSubscriptionProductIds = {
  'premium_monthly',
  'premium_yearly',
};

/// planId por productId (para enviar al backend en verify).
String planIdFromProductId(String productId) {
  return productId;
}
