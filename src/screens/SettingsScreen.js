import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius } from '../styles/theme';
import { useAds } from '../context/AdContext';

export default function SettingsScreen({ navigation }) {
  const {
    adsRemoved,
    isLoading,
    isPurchasing,
    purchaseRemoveAds,
    restorePurchases,
    getRemoveAdsProduct,
  } = useAds();

  const product = getRemoveAdsProduct();
  const price = product?.localizedPrice || '$1.99';

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://ajinkya1905.github.io/RummyScoreApp/');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Premium Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium</Text>
          
          {adsRemoved ? (
            <View style={styles.premiumCard}>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>✓ PREMIUM</Text>
              </View>
              <Text style={styles.premiumTitle}>Ads Removed</Text>
              <Text style={styles.premiumSubtitle}>
                Thank you for your support! Enjoy your ad-free experience.
              </Text>
            </View>
          ) : (
            <View style={styles.upgradeCard}>
              <View style={styles.upgradeHeader}>
                <Text style={styles.upgradeIcon}>✨</Text>
                <Text style={styles.upgradeTitle}>Remove Ads</Text>
              </View>
              <Text style={styles.upgradeDescription}>
                Enjoy an ad-free experience and support the developer!
              </Text>
              
              <View style={styles.benefitsList}>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitCheck}>✓</Text>
                  <Text style={styles.benefitText}>No banner ads</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitCheck}>✓</Text>
                  <Text style={styles.benefitText}>Cleaner interface</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitCheck}>✓</Text>
                  <Text style={styles.benefitText}>Support development</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitCheck}>✓</Text>
                  <Text style={styles.benefitText}>One-time purchase</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.purchaseButton}
                onPress={purchaseRemoveAds}
                disabled={isPurchasing || isLoading}
                activeOpacity={0.8}
              >
                {isPurchasing ? (
                  <ActivityIndicator color={colors.surface} />
                ) : (
                  <>
                    <Text style={styles.purchaseButtonText}>Remove Ads</Text>
                    <Text style={styles.purchasePrice}>{price}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.restoreButton}
                onPress={restorePurchases}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.restoreButtonText}>Restore Purchases</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutCard}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            
            <TouchableOpacity
              style={styles.aboutItem}
              onPress={handlePrivacyPolicy}
              activeOpacity={0.7}
            >
              <Text style={styles.aboutLabel}>Privacy Policy</Text>
              <Text style={styles.aboutLink}>View →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appLogo}>🃏</Text>
          <Text style={styles.appName}>Rummy Score</Text>
          <Text style={styles.appTagline}>Track your game scores easily</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  premiumCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  premiumBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginBottom: spacing.md,
  },
  premiumBadgeText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 12,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  upgradeCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  upgradeIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  upgradeDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  benefitsList: {
    marginBottom: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitCheck: {
    fontSize: 16,
    color: colors.success,
    marginRight: spacing.sm,
    fontWeight: 'bold',
  },
  benefitText: {
    fontSize: 14,
    color: colors.text,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  purchaseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
    marginRight: spacing.sm,
  },
  purchasePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
    opacity: 0.9,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  restoreButtonText: {
    fontSize: 14,
    color: colors.primary,
  },
  aboutCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aboutLabel: {
    fontSize: 16,
    color: colors.text,
  },
  aboutValue: {
    fontSize: 16,
    color: colors.textLight,
  },
  aboutLink: {
    fontSize: 16,
    color: colors.primary,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appLogo: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  appTagline: {
    fontSize: 14,
    color: colors.textLight,
  },
});
