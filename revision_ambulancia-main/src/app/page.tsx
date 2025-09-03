
import LoginForm from '@/components/auth/LoginForm';
import { AuthModeInfo, BackendModeInfo } from '@/components/shared/AuthModeInfo';
import { Ambulance } from 'lucide-react'; // Importa el icono

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      {/* Icono de la aplicación encima del formulario, como en el diseño original de AmbuReview */}
      <div className="mb-8">
        <Ambulance className="h-16 w-16 text-primary" />
      </div>
      <div className="w-full max-w-md space-y-6">
        <AuthModeInfo />
        <BackendModeInfo />
        <LoginForm />
      </div>
    </main>
  );
}
