
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AmbuReview - Sistema de Gestión
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema para la Gestión de Material y Revisiones de Ambulancias
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Acceso al Sistema</h2>
          <p className="text-gray-600 mb-4">
            Bienvenido al sistema de gestión de ambulancias.
          </p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Iniciar Sesión
          </button>
        </div>
      </div>
    </main>
  );
}
