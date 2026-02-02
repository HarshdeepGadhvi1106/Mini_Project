import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppData } from '@/context/AppDataContext';
import { getMockDetectedProducts } from '@/data/mockData';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const { inventory, setPendingBillItems } = useAppData();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  const takePicture = useCallback(async () => {
    if (!cameraRef.current || !permission?.granted) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        setPreviewMode(true);
      }
    } catch (e) {
      console.warn('Camera capture failed:', e);
    }
  }, [permission?.granted]);

  const confirmImage = useCallback(() => {
    const mockItems = getMockDetectedProducts(inventory);
    setPendingBillItems(mockItems);
    router.replace('/bill-edit' as const);
  }, [inventory, setPendingBillItems, router]);

  const retake = useCallback(() => {
    setCapturedUri(null);
    setPreviewMode(false);
  }, []);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>Requesting camera permission...</ThemedText>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText style={styles.message}>Camera access is needed to capture products</ThemedText>
        <TouchableOpacity style={styles.permButton} onPress={requestPermission}>
          <ThemedText style={styles.permButtonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
        {Platform.OS === 'web' && (
          <TouchableOpacity
            style={[styles.permButton, { marginTop: 12, backgroundColor: '#22c55e' }]}
            onPress={() => {
              const mockItems = getMockDetectedProducts(inventory);
              setPendingBillItems(mockItems);
              router.replace('/bill-edit' as const);
            }}
          >
            <ThemedText style={styles.permButtonText}>Use Mock Products (Web)</ThemedText>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  if (previewMode && capturedUri) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Image source={{ uri: capturedUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.previewOverlay}>
          <ThemedText type="subtitle" style={styles.previewTitle}>
            Confirm Image
          </ThemedText>
          <ThemedText style={styles.previewHint}>
            Use this image to detect products for your bill
          </ThemedText>
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.retakeBtn} onPress={retake}>
              <ThemedText style={styles.retakeBtnText}>Retake</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmImage}>
              <ThemedText style={styles.confirmBtnText}>Confirm</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill}>
        <View style={styles.captureOverlay}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <View style={styles.captureInner} />
          </TouchableOpacity>
          <ThemedText style={styles.captureHint}>Tap to capture products</ThemedText>
        </View>
      </CameraView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  message: {
    textAlign: 'center',
    margin: 24,
    color: '#fff',
  },
  permButton: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  permButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  captureOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 48,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
  },
  captureHint: {
    color: '#fff',
    marginTop: 16,
    fontSize: 14,
  },
  previewOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewTitle: {
    color: '#fff',
    marginBottom: 8,
  },
  previewHint: {
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
  },
  previewActions: {
    flexDirection: 'row',
    gap: 16,
  },
  retakeBtn: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    padding: 16,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
