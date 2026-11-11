import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

const CHAVE_TOKEN = 'eeats_jwt_bio'; // JWT, protegido por biometria (Keystore)
const CHAVE_FLAG = 'eeats_bio_habilitada'; // só indica qual tela mostrar; não dá acesso a nada

const OPCOES: SecureStore.SecureStoreOptions = {
  requireAuthentication: true,
  authenticationPrompt: 'Confirme sua digital para entrar no Easy-Eats',
};

export type Disponibilidade = 'disponivel' | 'sem_suporte' | 'sem_digital';

export type FalhaBiometria =
  | 'cancelado'
  | 'nao_reconhecida'
  | 'bloqueado'
  | 'sem_digital'
  | 'invalidada'
  | 'erro';

export type ResultadoEntrada =
  | { ok: true; token: string; usuario: string }
  | { ok: false; falha: FalhaBiometria };

// Os textos vêm do Android (ex.: "User canceled the authentication").
// Se algum caso cair em 'erro' nos testes, ajuste aqui olhando o log [biometria].
function classificarErro(e: unknown): FalhaBiometria {
  const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
  if (__DEV__) console.log('[biometria]', msg);

  if (msg.includes('cancel')) return 'cancelado';
  if (msg.includes('lockout') || msg.includes('locked') || msg.includes('too many')) {
    return 'bloqueado';
  }
  if (msg.includes('enrolled') || msg.includes('no biometrics')) return 'sem_digital';
  if (msg.includes('invalidated') || msg.includes('invalid')) return 'invalidada';
  if (msg.includes('not recognized') || msg.includes('failed')) return 'nao_reconhecida';
  return 'erro';
}

export async function verificarDisponibilidade(): Promise<Disponibilidade> {
  if (!(await LocalAuthentication.hasHardwareAsync())) return 'sem_suporte';
  if (!(await LocalAuthentication.isEnrolledAsync())) return 'sem_digital';
  if (!SecureStore.canUseBiometricAuthentication()) return 'sem_suporte';
  return 'disponivel';
}

export async function biometriaHabilitada(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(CHAVE_FLAG)) === '1';
  } catch {
    return false;
  }
}

// Remove o token protegido e a flag (JWT inválido, digitais alteradas etc.)
export async function limparBiometria(): Promise<void> {
  await SecureStore.deleteItemAsync(CHAVE_TOKEN).catch(() => {});
  await SecureStore.deleteItemAsync(CHAVE_FLAG).catch(() => {});
}

// No Android a escrita também exige a digital: o usuário verá um prompt aqui.
export async function habilitarBiometria(
  token: string,
  usuario: string,
): Promise<{ ok: true } | { ok: false; falha: FalhaBiometria }> {
  try {
    await SecureStore.setItemAsync(CHAVE_TOKEN, JSON.stringify({ token, usuario }), OPCOES);
    await SecureStore.setItemAsync(CHAVE_FLAG, '1');
    return { ok: true };
  } catch (e) {
    await limparBiometria();
    return { ok: false, falha: classificarErro(e) };
  }
}

// Só devolve o JWT depois que o Android validar a digital.
export async function entrarComBiometria(): Promise<ResultadoEntrada> {
  try {
    const salvo = await SecureStore.getItemAsync(CHAVE_TOKEN, OPCOES);

    if (!salvo) {
      await limparBiometria();
      return { ok: false, falha: 'invalidada' };
    }

    const dados = JSON.parse(salvo) as { token?: string; usuario?: string };
    if (!dados.token || !dados.usuario) {
      await limparBiometria();
      return { ok: false, falha: 'invalidada' };
    }
    return { ok: true, token: dados.token, usuario: dados.usuario };
  } catch (e) {
    const falha = classificarErro(e);
    if (falha === 'invalidada' || falha === 'sem_digital') await limparBiometria();
    return { ok: false, falha };
  }
}