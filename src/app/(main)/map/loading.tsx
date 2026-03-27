export default function MapLoading() {
  return (
    <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-56px)] bg-background-raised flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-text-secondary">加载地图中...</p>
      </div>
    </div>
  );
}
