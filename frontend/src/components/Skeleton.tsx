export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-primary-100 rounded-2xl overflow-hidden shadow-premium">
      <div className="aspect-square skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-3 skeleton rounded-lg w-1/3" />
        <div className="h-4 skeleton rounded-lg w-2/3" />
        <div className="flex gap-2">
          <div className="h-4 skeleton rounded-lg w-20" />
          <div className="h-4 skeleton rounded-lg w-14" />
        </div>
      </div>
    </div>
  );
}
