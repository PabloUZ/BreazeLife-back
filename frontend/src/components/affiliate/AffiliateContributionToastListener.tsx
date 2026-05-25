import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthContext } from "@/src/context/AuthContext";
import type { NotificationDto } from "@/src/dtos/notification/notification.dtos";
import { notificationSocket } from "@/src/services/ws/notificationSocket";

type ToastState = {
  id: string;
  message: string;
};

const moneyFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export default function AffiliateContributionToastListener() {
  const insets = useSafeAreaInsets();
  const { state } = useAuthContext();
  const [toast, setToast] = useState<ToastState | null>(null);
  const translateY = useRef(new Animated.Value(-32)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const topOffset = useMemo(() => insets.top + 12, [insets.top]);

  useEffect(() => {
    if (state.role !== "affiliate" || !state.accessToken) {
      return;
    }

    const unsubscribe = notificationSocket.subscribe((notification) => {
      if (notification.type !== "CONTRIBUTION_APPROVED") {
        return;
      }

      showToast(buildContributionMessage(notification), notification.notification_id);
    });

    notificationSocket.connect(state.accessToken);

    return () => {
      unsubscribe();

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [state.accessToken, state.role]);

  function showToast(message: string, notificationId: string) {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    setToast({
      id: notificationId,
      message,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
      // Ignore haptics errors on unsupported devices.
    });

    translateY.setValue(-32);
    opacity.setValue(0);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    hideTimeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -18,
          duration: 180,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setToast((current) =>
            current?.id === notificationId ? null : current
          );
        }
      });
    }, 4200);
  }

  if (!toast) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.wrapper,
          {
            top: topOffset,
            opacity,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Abono confirmado</Text>
          <Text style={styles.message}>{toast.message}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function buildContributionMessage(notification: NotificationDto): string {
  if (
    typeof notification.accumulated_amount === "number" &&
    typeof notification.new_balance === "number"
  ) {
    return `Tu aporte de ${moneyFormatter.format(
      notification.accumulated_amount
    )} fue aprobado. Nuevo saldo: ${moneyFormatter.format(
      notification.new_balance
    )}.`;
  }

  return notification.message;
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: "#0F172A",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 7,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#16A34A",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#F8FAFC",
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    color: "#CBD5E1",
  },
});
