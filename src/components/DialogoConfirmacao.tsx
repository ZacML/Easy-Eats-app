import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  visivel: boolean;
  icone: (props: { size: number; color: string }) => ReactNode;
  titulo: string;
  mensagem: string;
  textoConfirmar: string;
  textoCancelar: string;
  variante?: 'padrao' | 'perigo';
  onConfirmar: () => void;
  onCancelar: () => void;
};

const LARANJA = '#EA580C';
const VERMELHO = '#B91C1C';

export default function DialogoConfirmacao({
  visivel,
  icone,
  titulo,
  mensagem,
  textoConfirmar,
  textoCancelar,
  variante = 'padrao',
  onConfirmar,
  onCancelar,
}: Props) {
  const escala = useRef(new Animated.Value(0.92)).current;
  const perigo = variante === 'perigo';
  const cor = perigo ? VERMELHO : LARANJA;

  useEffect(() => {
    if (!visivel) return;
    escala.setValue(0.92);
    Animated.spring(escala, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }).start();
  }, [visivel, escala]);

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancelar}
    >
      <Pressable style={styles.fundo} onPress={onCancelar}>
        {/* Pressable interno impede que o toque no cartão feche o diálogo */}
        <Pressable>
          <Animated.View style={[styles.cartao, { transform: [{ scale: escala }] }]}>
            <View style={[styles.icone, { backgroundColor: perigo ? '#FEF2F2' : '#FFF7ED' }]}>
              {icone({ size: 28, color: cor })}
            </View>

            <Text style={styles.titulo}>{titulo}</Text>
            <Text style={styles.mensagem}>{mensagem}</Text>

            <TouchableOpacity
              style={[styles.botao, { backgroundColor: cor }]}
              onPress={onConfirmar}
              accessibilityRole="button"
            >
              <Text style={styles.botaoTexto}>{textoConfirmar}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, styles.botaoSecundario]}
              onPress={onCancelar}
              accessibilityRole="button"
            >
              <Text style={styles.botaoSecundarioTexto}>{textoCancelar}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  cartao: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  icone: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titulo: { fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  mensagem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  botao: {
    alignSelf: 'stretch',
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { fontSize: 15, fontWeight: '600', color: '#fff' },
  botaoSecundario: { marginTop: 10, backgroundColor: '#F1F5F9' },
  botaoSecundarioTexto: { fontSize: 15, fontWeight: '600', color: '#334155' },
});