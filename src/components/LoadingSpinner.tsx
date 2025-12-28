export default function LoadingSpinner() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          Cargando datos de tratamientos...
        </h2>
        <p className="text-sm text-gray-500">
          Conectando con la base de datos MongoDB
        </p>
      </div>
    </div>
  );
}






