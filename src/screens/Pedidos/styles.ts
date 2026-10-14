import { StyleSheet, Platform, StatusBar } from "react-native";

export const LARANJA = '#EA580C';
const TOPO = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 50;

export const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#F8FAFC" },
  barra: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: TOPO + 8,
    paddingBottom: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  marca: { fontSize: 18, fontWeight: "bold", color: "#0F172A" },
  barraDireita: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTexto: { fontWeight: "bold", color: LARANJA },
  botaoIcone: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  conteudo: { padding: 16, paddingBottom: 110 },
  titulo: { fontSize: 28, fontWeight: "bold", color: "#0F172A" },
  subtitulo: { fontSize: 14, color: "#64748B", marginTop: 6, marginBottom: 18 },
  campo: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    color: "#0F172A",
  },
  erroBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  erro: { color: "#B91C1C" },
  tentar: { marginTop: 8, color: LARANJA, fontWeight: "700" },
  categorias: { gap: 8, paddingVertical: 4, marginTop: 14 },
  categoria: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoriaAtiva: { backgroundColor: LARANJA, borderColor: LARANJA },
  categoriaTexto: { color: "#64748B", fontSize: 13, fontWeight: "600" },
  categoriaTextoAtivo: { color: "#fff" },
  grade: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 12,
  },
  card: {
    width: "48%",
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  nome: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  descricao: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
    marginTop: 6,
    minHeight: 34,
  },
  preco: { fontSize: 14, fontWeight: "bold", color: LARANJA, marginTop: 8 },
  cardBase: { marginTop: 10, minHeight: 28, justifyContent: "center" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 14 },
  qtd: { fontWeight: "700", color: "#0F172A" },
  adicionar: { color: "#64748B", fontSize: 12 },
  vazio: { textAlign: "center", color: "#64748B", marginTop: 32 },
  rodape: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resumoQtd: { fontSize: 12, color: "#64748B" },
  resumoTotal: { fontSize: 18, fontWeight: "bold", color: "#0F172A" },
  botaoFinalizar: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: LARANJA,
    justifyContent: "center",
  },
  botaoFinalizarTexto: { fontSize: 15, fontWeight: "600", color: "#fff" },
  comboboxContainer: {
    marginTop: 4,
    position: "relative",
    zIndex: 10,
  },

  comboboxLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },

  combobox: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E8F0",

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  comboboxTexto: {
    fontSize: 14,
    color: "#0F172A",
  },

  placeholder: {
    color: "#94A3B8",
  },

  listaMesas: {
    position: "absolute",
    top: 76,
    left: 0,
    right: 0,

    backgroundColor: "#fff",

    borderWidth: 1,
    borderColor: "#E2E8F0",

    borderRadius: 10,

    maxHeight: 220,

    elevation: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  opcaoMesa: {
    minHeight: 48,
    paddingHorizontal: 14,

    flexDirection: "row",
    alignItems: "center",

    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",

    gap: 10,
  },

  opcaoMesaSelecionada: {
    backgroundColor: "#FFF7ED",
  },

  mesaIcone: {
    width: 30,
    height: 30,

    borderRadius: 8,

    backgroundColor: "#FFEDD5",

    alignItems: "center",
    justifyContent: "center",
  },

  opcaoMesaTexto: {
    flex: 1,

    fontSize: 14,
    fontWeight: "600",

    color: "#1E293B",
  },

  semMesas: {
    padding: 16,

    textAlign: "center",

    color: "#94A3B8",

    fontSize: 13,
  },
});
