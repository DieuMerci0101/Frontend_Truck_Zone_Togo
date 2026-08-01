export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/logo1.jpeg"
          alt="Togo Truck Connect"
          className="h-16 w-auto object-contain rounded-full animate-spin"
        />
        <div className="text-sm text-slate-500">Chargement...</div>
      </div>
    </div>
  );
}
