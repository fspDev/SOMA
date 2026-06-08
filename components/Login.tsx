import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { MushroomIcon } from '../constants';
import iconPng from '../icon.png';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isLogin && password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      switch(err.code) {
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
          setError('Credenciales inválidas. Verifica tu correo y contraseña.');
          break;
        case 'auth/wrong-password':
          setError('Contraseña incorrecta.');
          break;
        case 'auth/email-already-in-use':
          setError('Este correo electrónico ya está en uso.');
          break;
        case 'auth/weak-password':
          setError('La contraseña debe tener al menos 6 caracteres.');
          break;
        default:
          setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-main text-theme-main flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-2">
                <img src={iconPng} alt="SOMA Logo" className="w-12 h-12 sm:w-14 sm:h-14 object-contain"/>
                <h1 className="text-4xl sm:text-5xl font-bold text-[#3ABDC5]">
                SOMA
                </h1>
            </div>
            <p className="text-lg text-theme-muted">Equilibrio entre cuerpo y conciencia</p>
        </div>

        <div className="bg-theme-card border border-theme rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-center text-theme-main mb-6">
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-theme-muted">Correo Electrónico</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full bg-theme-input border border-theme rounded-md shadow-sm p-3 focus:ring-[#00BFA5] focus:border-[#00BFA5] text-theme-main placeholder-theme"
                        placeholder="tu@email.com"
                    />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-theme-muted">Contraseña</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full bg-theme-input border border-theme rounded-md shadow-sm p-3 focus:ring-[#00BFA5] focus:border-[#00BFA5] text-theme-main placeholder-theme"
                        placeholder="••••••••"
                    />
                </div>

                {!isLogin && (
                    <div>
                        <label htmlFor="confirm-password"className="block text-sm font-medium text-theme-muted">Confirmar Contraseña</label>
                        <input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full bg-theme-input border border-theme rounded-md shadow-sm p-3 focus:ring-[#00BFA5] focus:border-[#00BFA5] text-theme-main placeholder-theme"
                            placeholder="••••••••"
                        />
                    </div>
                )}

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00BFA5] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00BFA5] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
                    </button>
                </div>
            </form>

            <p className="mt-6 text-center text-sm">
                <button onClick={() => { setIsLogin(!isLogin); setError(null); setConfirmPassword(''); }} className="font-medium text-theme-muted hover:text-[#00BFA5]">
                    {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;