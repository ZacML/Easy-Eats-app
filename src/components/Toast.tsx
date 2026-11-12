import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

const DURACAO_VISIVEL = 2500;
const DURACAO_ANIMACAO = 220;

// Uso: const { toast, mostrarToast } = useToast(); renderizar {toast} na raiz da tela.
export function useToast() {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const anim = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [erro, setErro] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const mostrarToast = useCallback(
    (texto: string, ehErro = false) => {
      clearTimeout(timer.current);
      setMensagem(texto);
      setErro(ehErro);
      anim.setValue(0);
      Animated.timing(anim, {
        toValue: 1,
        duration: DURACAO_ANIMACAO,
        useNativeDriver: true,
      }).start();

      timer.current = setTimeout(() => {
        Animated.timing(anim, {
          toValue: 0,
          duration: DURACAO_ANIMACAO,
          useNativeDriver: true,
        }).start(({ finished }) => finished && setMensagem(null));
      }, DURACAO_VISIVEL);
    },
    [anim],
  );

  const toast = mensagem ? (
    <View style={styles.area} pointerEvents="none">
      <Animated.View
        accessibilityLiveRegion="polite"
        style={[
          styles.toast,
          {
            opacity: anim,
            transform: [
              {
                translateY: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Feather
          name={erro ? "alert-circle" : "check-circle"}
          size={20}
          color={erro ? "#EF4444" : "#22C55E"}
        />
        <Text style={styles.texto}>{mensagem}</Text>
      </Animated.View>
    </View>
  ) : null;

  return { toast, mostrarToast };
}

const styles = StyleSheet.create({
  area: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 32,
    alignItems: "center",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    maxWidth: 420,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#1E232B",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  texto: { flexShrink: 1, fontSize: 14, fontWeight: "600", color: "#fff" },
});
