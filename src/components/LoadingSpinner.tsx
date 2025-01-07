import React from "react";

const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex flex-col items-center">
        {/* Spinner animado */}
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-75 border-solid"></div>
        {/* Mensaje opcional */}
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
