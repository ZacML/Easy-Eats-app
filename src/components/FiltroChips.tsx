import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { styles } from '../screens/Pedidos/styles';

type Opcao<T> = { id: T; nome: string };

type Props<T> = {
  opcoes: Opcao<T>[];
  selecionado: T | null;
  onSelecionar: (id: T | null) => void;
};

export default function FiltroChips<T extends string | number>({
  opcoes,
  selecionado,
  onSelecionar,
}: Props<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.categorias}
    >
      <TouchableOpacity
        style={[styles.categoria, selecionado == null && styles.categoriaAtiva]}
        onPress={() => onSelecionar(null)}
      >
        <Text style={[styles.categoriaTexto, selecionado == null && styles.categoriaTextoAtivo]}>Todos</Text>
      </TouchableOpacity>

      {opcoes.map((opcao) => (
        <TouchableOpacity
          key={opcao.id}
          style={[styles.categoria, selecionado === opcao.id && styles.categoriaAtiva]}
          onPress={() => onSelecionar(opcao.id)}
        >
          <Text style={[styles.categoriaTexto, selecionado === opcao.id && styles.categoriaTextoAtivo]}>
            {opcao.nome}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}