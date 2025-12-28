interface Props {
  error: Error;
  onRetry: () => void;
}

export default function ErrorDisplay({ error, onRetry }: Props) {
  const isDev = import.meta.env.DEV;

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error al cargar datos
          </h2>
          <p className="text-gray-700 mb-6">
            No pudimos cargar los datos de tratamientos desde MongoDB. Por favor, intenta nuevamente.
          </p>
          
          {isDev && (
            <details className="mb-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-semibold">
                📋 Detalles técnicos (solo en desarrollo)
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md"
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}






