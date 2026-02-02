import { useCallback, useMemo, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAppData } from '@/context/AppDataContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MOCK_MONTHLY_EXPENSES = 12000;

export default function AccountScreen() {
  const { profile, bills, inventory, updateProfile, loading } = useAppData();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [storeName, setStoreName] = useState(profile.storeName);
  const [ownerName, setOwnerName] = useState(profile.ownerName);
  const [openingBalance, setOpeningBalance] = useState(String(profile.openingBalance));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { totalRevenue, netProfit, bestSelling, avgDailySales, health } = useMemo(() => {
    const revenue = bills.reduce((sum, b) => sum + b.total, 0);
    const expenses = MOCK_MONTHLY_EXPENSES;
    const profit = revenue - expenses;
    const itemCount: Record<string, number> = {};
    for (const bill of bills) {
      for (const item of bill.items) {
        itemCount[item.name] = (itemCount[item.name] ?? 0) + item.quantity;
      }
    }
    const sorted = Object.entries(itemCount).sort((a, b) => b[1] - a[1]);
    const bestSelling = sorted.slice(0, 5);
    const firstBill = bills[bills.length - 1];
    const lastBill = bills[0];
    const days =
      firstBill && lastBill
        ? Math.max(
            1,
            (new Date(lastBill.createdAt).getTime() - new Date(firstBill.createdAt).getTime()) /
              (24 * 60 * 60 * 1000)
          )
        : 1;
    const avgDaily = revenue / days;
    const health = profit >= 0 ? 'Healthy' : 'Needs attention';

    return {
      totalRevenue: revenue,
      netProfit: profit,
      bestSelling,
      avgDailySales: avgDaily,
      health,
    };
  }, [bills]);

  const saveProfile = useCallback(() => {
    const balance = Math.max(0, parseFloat(openingBalance) || 0);
    updateProfile({
      storeName: storeName.trim() || profile.storeName,
      ownerName: ownerName.trim() || profile.ownerName,
      openingBalance: balance,
    });
    setEditModalVisible(false);
  }, [storeName, ownerName, openingBalance, updateProfile, profile]);

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
          Account
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Profile & business analytics
        </ThemedText>

        <ThemedView style={styles.profileCard}>
          <ThemedText type="defaultSemiBold">{profile.storeName}</ThemedText>
          <ThemedText style={styles.profileMeta}>{profile.ownerName}</ThemedText>
          <ThemedText style={styles.profileMeta}>
            Opening balance: ₹{profile.openingBalance.toFixed(2)}
          </ThemedText>
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: colors.tint }]}
            onPress={() => {
              setStoreName(profile.storeName);
              setOwnerName(profile.ownerName);
              setOpeningBalance(String(profile.openingBalance));
              setEditModalVisible(true);
            }}
          >
            <ThemedText style={[styles.editBtnText, { color: colors.tint }]}>
              Update Profile
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Business Analytics
        </ThemedText>

        <View style={styles.analyticsGrid}>
          <ThemedView style={styles.analyticCard}>
            <ThemedText style={styles.analyticLabel}>Total Revenue</ThemedText>
            <ThemedText style={styles.analyticValue}>₹{totalRevenue.toFixed(2)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.analyticCard}>
            <ThemedText style={styles.analyticLabel}>Net Profit/Loss</ThemedText>
            <ThemedText
              style={[
                styles.analyticValue,
                { color: netProfit >= 0 ? '#22c55e' : '#ef4444' },
              ]}
            >
              {netProfit >= 0 ? '+' : ''}₹{netProfit.toFixed(2)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.analyticCard}>
            <ThemedText style={styles.analyticLabel}>Avg Daily Sales</ThemedText>
            <ThemedText style={styles.analyticValue}>₹{avgDailySales.toFixed(0)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.analyticCard}>
            <ThemedText style={styles.analyticLabel}>Business Health</ThemedText>
            <ThemedText
              style={[
                styles.analyticValue,
                { color: health === 'Healthy' ? '#22c55e' : '#f59e0b' },
              ]}
            >
              {health}
            </ThemedText>
          </ThemedView>
        </View>

        <ThemedView style={styles.bestSelling}>
          <ThemedText type="subtitle">Best Selling Products</ThemedText>
          {bestSelling.length > 0 ? (
            bestSelling.map(([name, qty], i) => (
              <View key={name} style={styles.bestRow}>
                <ThemedText>
                  {i + 1}. {name}
                </ThemedText>
                <ThemedText type="defaultSemiBold">{qty} sold</ThemedText>
              </View>
            ))
          ) : (
            <ThemedText style={styles.emptyHint}>No sales data yet</ThemedText>
          )}
        </ThemedView>
      </ScrollView>

      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modal}>
            <ThemedText type="title" style={styles.modalTitle}>
              Update Profile
            </ThemedText>
            <ThemedText style={styles.label}>Store Name</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={storeName}
              onChangeText={setStoreName}
              placeholder="Store name"
              placeholderTextColor={colors.icon}
            />
            <ThemedText style={styles.label}>Owner Name</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={ownerName}
              onChangeText={setOwnerName}
              placeholder="Owner name"
              placeholderTextColor={colors.icon}
            />
            <ThemedText style={styles.label}>Opening Balance (₹)</ThemedText>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={openingBalance}
              onChangeText={setOpeningBalance}
              placeholder="0"
              placeholderTextColor={colors.icon}
              keyboardType="decimal-pad"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <ThemedText style={{ color: colors.tint }}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.tint }]}
                onPress={saveProfile}
              >
                <ThemedText style={styles.saveBtnText}>Save</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
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
  profileCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  profileMeta: {
    marginTop: 4,
    opacity: 0.8,
  },
  editBtn: {
    marginTop: 16,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  editBtnText: {
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  analyticCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  analyticLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  analyticValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  bestSelling: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  bestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  emptyHint: {
    opacity: 0.6,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.3)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
  },
  saveBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
