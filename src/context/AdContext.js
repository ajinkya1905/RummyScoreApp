import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases,
  flushFailedPurchasesCachedAsPendingAndroid,
} from 'react-native-iap';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { 
  IAP_PRODUCTS, 
  STORAGE_KEYS, 
  AD_UNIT_IDS 
} from '../constants/ads';

const AdContext = createContext();

// Product SKUs for IAP
const productSkus = Platform.select({
  android: [IAP_PRODUCTS.REMOVE_ADS],
  ios: [IAP_PRODUCTS.REMOVE_ADS],
});

export function AdProvider({ children }) {
  const [adsRemoved, setAdsRemoved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Initialize IAP connection and check for existing purchases
  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    const initializeIAP = async () => {
      try {
        // Check local storage first
        const storedValue = await AsyncStorage.getItem(STORAGE_KEYS.ADS_REMOVED);
        if (storedValue === 'true') {
          setAdsRemoved(true);
        }

        // Initialize IAP connection
        await initConnection();

        // Clear any pending purchases on Android
        if (Platform.OS === 'android') {
          try {
            await flushFailedPurchasesCachedAsPendingAndroid();
          } catch (flushError) {
            // Non-critical error, ignore
          }
        }

        // Get available products with retry
        let availableProducts = await fetchProducts({ skus: productSkus });
        
        // Retry once if no products found (Google Play can be slow)
        if (!availableProducts || availableProducts.length === 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          availableProducts = await fetchProducts({ skus: productSkus });
        }
        
        setProducts(availableProducts || []);

        // Check for existing purchases (restore purchases)
        const purchases = await getAvailablePurchases();
        const hasRemoveAdsPurchase = purchases.some(
          (purchase) => (purchase.productId || purchase.id) === IAP_PRODUCTS.REMOVE_ADS
        );

        if (hasRemoveAdsPurchase) {
          setAdsRemoved(true);
          await AsyncStorage.setItem(STORAGE_KEYS.ADS_REMOVED, 'true');
        }
      } catch (error) {
        // Still allow app to work without IAP
      } finally {
        setIsLoading(false);
      }
    };

    // Set up purchase listeners
    purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      if ((purchase.productId || purchase.id) === IAP_PRODUCTS.REMOVE_ADS) {
        try {
          await finishTransaction({ purchase, isConsumable: false });
          setAdsRemoved(true);
          await AsyncStorage.setItem(STORAGE_KEYS.ADS_REMOVED, 'true');
          Alert.alert(
            'Purchase Successful! 🎉',
            'Ads have been removed. Thank you for your support!',
            [{ text: 'OK' }]
          );
        } catch (error) {
          // Error finishing transaction
        }
      }
      setIsPurchasing(false);
    });

    purchaseErrorSubscription = purchaseErrorListener((error) => {
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert(
          'Purchase Error',
          'Something went wrong. Please try again later.',
          [{ text: 'OK' }]
        );
      }
      setIsPurchasing(false);
    });

    initializeIAP();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      endConnection();
    };
  }, []);

  // Purchase remove ads
  const purchaseRemoveAds = useCallback(async () => {
    if (isPurchasing) return;

    // Check if product is available
    const product = products.find((p) => (p.id || p.productId) === IAP_PRODUCTS.REMOVE_ADS);
    if (!product) {
      Alert.alert(
        'Product Unavailable',
        'The remove ads product is not available. Please try again later.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsPurchasing(true);
    try {
      const productId = product.id || product.productId;
      
      await requestPurchase({
        type: 'in-app',
        request: {
          google: {
            skus: [productId],
          },
          apple: {
            sku: productId,
          },
        },
      });
    } catch (error) {
      setIsPurchasing(false);
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert(
          'Purchase Error',
          `Error: ${error.message || JSON.stringify(error)}`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [isPurchasing, products]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const purchases = await getAvailablePurchases();
      const hasRemoveAdsPurchase = purchases.some(
        (purchase) => (purchase.productId || purchase.id) === IAP_PRODUCTS.REMOVE_ADS
      );

      if (hasRemoveAdsPurchase) {
        setAdsRemoved(true);
        await AsyncStorage.setItem(STORAGE_KEYS.ADS_REMOVED, 'true');
        Alert.alert(
          'Purchases Restored',
          'Your ad-free experience has been restored!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'No Purchases Found',
          'No previous purchases were found for this account.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Restore Error',
        'Unable to restore purchases. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get remove ads product details
  const getRemoveAdsProduct = useCallback(() => {
    return products.find((p) => (p.id || p.productId) === IAP_PRODUCTS.REMOVE_ADS);
  }, [products]);

  // Interstitial Ad management
  const interstitialRef = useRef(null);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  // Load interstitial ad
  const loadInterstitial = useCallback(() => {
    if (adsRemoved) return;

    const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setInterstitialLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitialLoaded(false);
      // Reload for next time
      loadInterstitial();
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, () => {
      setInterstitialLoaded(false);
    });

    interstitialRef.current = {
      ad: interstitial,
      unsubscribe: () => {
        unsubscribeLoaded();
        unsubscribeClosed();
        unsubscribeError();
      },
    };

    interstitial.load();
  }, [adsRemoved]);

  // Show interstitial ad
  const showInterstitial = useCallback(async () => {
    if (adsRemoved) {
      return false;
    }

    if (interstitialLoaded && interstitialRef.current?.ad) {
      try {
        await interstitialRef.current.ad.show();
        return true;
      } catch (error) {
        // Try to reload for next time
        loadInterstitial();
        return false;
      }
    } else {
      loadInterstitial();
      return false;
    }
  }, [adsRemoved, interstitialLoaded, loadInterstitial]);

  // Load interstitial on mount (if ads not removed)
  useEffect(() => {
    if (!adsRemoved && !isLoading) {
      loadInterstitial();
    }

    return () => {
      if (interstitialRef.current?.unsubscribe) {
        interstitialRef.current.unsubscribe();
      }
    };
  }, [adsRemoved, isLoading, loadInterstitial]);

  const value = {
    adsRemoved,
    isLoading,
    isPurchasing,
    products,
    purchaseRemoveAds,
    restorePurchases,
    getRemoveAdsProduct,
    showInterstitial,
    interstitialLoaded,
    loadInterstitial,
  };

  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAds() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
}

export default AdContext;
