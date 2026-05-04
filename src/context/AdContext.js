import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases,
} from 'react-native-iap';
import { 
  IAP_PRODUCTS, 
  STORAGE_KEYS, 
  DEBUG_FORCE_ADS_REMOVED, 
  DEBUG_FORCE_SHOW_ADS 
} from '../constants/ads';

const AdContext = createContext();

// Product SKUs for IAP
const productSkus = Platform.select({
  android: [IAP_PRODUCTS.REMOVE_ADS],
  ios: [IAP_PRODUCTS.REMOVE_ADS],
});

export function AdProvider({ children }) {
  // Apply debug flag for initial state
  const [adsRemoved, setAdsRemoved] = useState(DEBUG_FORCE_ADS_REMOVED);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Compute effective ads removed state (respects debug flags)
  const effectiveAdsRemoved = DEBUG_FORCE_SHOW_ADS 
    ? false 
    : (DEBUG_FORCE_ADS_REMOVED || adsRemoved);

  // Initialize IAP connection and check for existing purchases
  useEffect(() => {
    let purchaseUpdateSubscription;
    let purchaseErrorSubscription;

    const initializeIAP = async () => {
      try {
        // Skip IAP init if debug flag forces ads removed
        if (DEBUG_FORCE_ADS_REMOVED) {
          setIsLoading(false);
          return;
        }

        // Check local storage first
        const storedValue = await AsyncStorage.getItem(STORAGE_KEYS.ADS_REMOVED);
        if (storedValue === 'true') {
          setAdsRemoved(true);
        }

        // Initialize IAP connection
        await initConnection();

        // Get available products
        const availableProducts = await getProducts({ skus: productSkus });
        setProducts(availableProducts);

        // Check for existing purchases (restore purchases)
        const purchases = await getAvailablePurchases();
        const hasRemoveAdsPurchase = purchases.some(
          (purchase) => purchase.productId === IAP_PRODUCTS.REMOVE_ADS
        );

        if (hasRemoveAdsPurchase) {
          setAdsRemoved(true);
          await AsyncStorage.setItem(STORAGE_KEYS.ADS_REMOVED, 'true');
        }
      } catch (error) {
        console.log('IAP initialization error:', error);
        // Still allow app to work without IAP
      } finally {
        setIsLoading(false);
      }
    };

    // Set up purchase listeners
    purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      if (purchase.productId === IAP_PRODUCTS.REMOVE_ADS) {
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
          console.log('Error finishing transaction:', error);
        }
      }
      setIsPurchasing(false);
    });

    purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.log('Purchase error:', error);
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

    setIsPurchasing(true);
    try {
      await requestPurchase({ sku: IAP_PRODUCTS.REMOVE_ADS });
    } catch (error) {
      console.log('Purchase request error:', error);
      setIsPurchasing(false);
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert(
          'Purchase Error',
          'Unable to process purchase. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  }, [isPurchasing]);

  // Restore purchases
  const restorePurchases = useCallback(async () => {
    setIsLoading(true);
    try {
      const purchases = await getAvailablePurchases();
      const hasRemoveAdsPurchase = purchases.some(
        (purchase) => purchase.productId === IAP_PRODUCTS.REMOVE_ADS
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
      console.log('Restore error:', error);
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
    return products.find((p) => p.productId === IAP_PRODUCTS.REMOVE_ADS);
  }, [products]);

  const value = {
    adsRemoved: effectiveAdsRemoved, // Uses debug flags
    isLoading,
    isPurchasing,
    products,
    purchaseRemoveAds,
    restorePurchases,
    getRemoveAdsProduct,
    // Expose debug info for development
    _debug: __DEV__ ? { 
      DEBUG_FORCE_ADS_REMOVED, 
      DEBUG_FORCE_SHOW_ADS,
      actualAdsRemoved: adsRemoved 
    } : null,
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
