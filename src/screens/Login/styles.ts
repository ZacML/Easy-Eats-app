import { Platform, StatusBar, StyleSheet } from "react-native";

export const LARANJA = '#EA580C';
const TOPO = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 50;

export const styles = StyleSheet.create({
  tela: { flexGrow: 1, backgroundColor: "#fff" },
  topo: {
    backgroundColor: "#1E232B",
    padding: 28,
    paddingTop: TOPO + 40,
    paddingBottom: 44,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  marca: { fontSize: 30, fontWeight: "bold", color: "#fff" },
  slogan: { fontSize: 15, lineHeight: 22, color: "#E2E8F0", marginTop: 8 },
  form: { flex: 1, padding: 28, paddingTop: 32 },
  titulo: { fontSize: 24, fontWeight: "bold", color: "#0F172A" },
  subtitulo: { fontSize: 14, color: "#64748B", marginTop: 4, marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#1E293B", marginBottom: 8 },
  linha: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  campo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#E8EEFC",
  },
  input: { flex: 1, fontSize: 15, color: "#0F172A" },
  erro: {
    marginTop: 16,
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    color: "#B91C1C",
    backgroundColor: "#FEF2F2",
  },
  botao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 10,
    backgroundColor: LARANJA,
    marginTop: 24,
  },
  botaoTexto: { fontSize: 15, fontWeight: "600", color: "#fff" },
});
