import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppData } from '@/context/AppDataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MOCK_DAILY_EXPENSES = 850;
const MOCK_PENDING_PAYMENTS = 1200;

export default function CashflowScreen() {
  const { inventory, bills, profile, loading } = useAppData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { totalSales, inventoryValue, cashBalance, monthlySales, dailyAvg } = useMemo(() => {
    const sales = bills.reduce((sum, b) => sum + b.total, 0);
    const invValue = inventory.reduce((sum, p) => sum + p.quantity * p.price, 0);
    const expenses = MOCK_DAILY_EXPENSES * 30;
    const cashBalance = profile.openingBalance + sales - expenses;
    const now = new Date();
    const thisMonth = bills.filter(
      (b) => new Date(b.createdAt).getMonth() === now.getMonth()
    );
    const monthlySales = thisMonth.reduce((s, b) => s + b.total, 0);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyAvg = daysInMonth > 0 ? monthlySales / daysInMonth : 0;

    return {
      totalSales: sales,
      inventoryValue: invValue,
      cashBalance,
      monthlySales,
      dailyAvg,
    };
  }, [bills, inventory, profile.openingBalance]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ThemedText>Loading...</ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.title}>
          Cashflow
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Overview of your money flow
        </ThemedText>

        <View style={styles.cards}>
          <ThemedView style={[styles.card, styles.primaryCard]}>
            <ThemedText style={styles.cardLabel}>Cash Balance</ThemedText>
            <ThemedText style={styles.cardValue}>
              ₹{Math.max(0, cashBalance).toFixed(2)}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardLabel}>Total Sales</ThemedText>
            <ThemedText style={styles.cardValue}>₹{totalSales.toFixed(2)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardLabel}>Locked in Inventory</ThemedText>
            <ThemedText style={styles.cardValue}>₹{inventoryValue.toFixed(2)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardLabel}>Pending Payments</ThemedText>
            <ThemedText style={styles.cardValue}>₹{MOCK_PENDING_PAYMENTS.toFixed(2)}</ThemedText>
            <ThemedText style={styles.cardHint}>(Mock)</ThemedText>
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardLabel}>Monthly Sales</ThemedText>
            <ThemedText style={styles.cardValue}>₹{monthlySales.toFixed(2)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText style={styles.cardLabel}>Avg Daily Sales</ThemedText>
            <ThemedText style={styles.cardValue}>₹{dailyAvg.toFixed(0)}</ThemedText>
          </ThemedView>
        </View>

        <ThemedView style={styles.chartSection}>
          <ThemedText type="subtitle">Cashflow Chart</ThemedText>
          <ThemedText style={styles.chartHint}>Visual representation (UI only)</ThemedText>
          <View style={styles.chartPlaceholder}>
            <View
              style={[
                styles.chartBar,
                {
                  height: `${Math.min(100, (monthlySales / 5000) * 100)}%`,
                  backgroundColor: colors.tint,
                },
              ]}
            />
            <View
              style={[
                styles.chartBar,
                {
                  height: `${Math.min(100, (dailyAvg / 200) * 100)}%`,
                  backgroundColor: colors.tint + '80',
                },
              ]}
            />
            <View
              style={[
                styles.chartBar,
                {
                  height: `${Math.min(100, (inventoryValue / 3000) * 100)}%`,
                  backgroundColor: colors.tint + '60',
                },
              ]}
            />
          </View>
          <View style={styles.chartLabels}>
            <ThemedText style={styles.chartLabel}>Monthly</ThemedText>
            <ThemedText style={styles.chartLabel}>Daily</ThemedText>
            <ThemedText style={styles.chartLabel}>Inv</ThemedText>
          </View>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.8,
    marginBottom: 24,
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  card: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  primaryCard: {
    minWidth: '100%',
  },
  cardLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardHint: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 2,
  },
  chartSection: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  chartHint: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 16,
  },
  chartPlaceholder: {
    flexDirection: 'row',
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    gap: 16,
  },
  chartBar: {
    flex: 1,
    borderRadius: 6,
    minHeight: 8,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  chartLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
});
