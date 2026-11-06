interface PhotoTileProps {
  url?: string;
  alt?: string;
}

// Photo shown as a <div> background (no <img>)
export const PhotoTile = ({ url, alt = "photo" }: PhotoTileProps) => {
  return (
    <div
      title={alt}
      className="aspect-square w-full rounded-xl border-2 border-[#dfe4ee] bg-[#f4f6fb] bg-cover bg-center"
      style={url ? { backgroundImage: `url(${url})` } : undefined}
    />
  );
};

export default PhotoTile;
