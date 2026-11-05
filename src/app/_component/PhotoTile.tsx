// 🟡 CHANGED: PhotoTile now shows a real photo from Supabase (it was an empty box).
interface PhotoTileProps {
  url?: string;
  alt?: string;
}

export const PhotoTile = ({ url, alt = "photo" }: PhotoTileProps) => {
  return (
    <div className="aspect-square w-full rounded-xl border-2 border-[#dfe4ee] overflow-hidden bg-[#f4f6fb]">
      {url && (
        // plain <img> so we don't need to configure next/image for Supabase
        <img src={url} alt={alt} className="w-full h-full object-cover" />
      )}
    </div>
  );
};
