export default function Loader({
  text = 'Chargement...',
  fullScreen = false,
}) {
  return (
    <div
      className={
        fullScreen
          ? 'min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-4 text-white'
          : 'flex flex-col items-center justify-center gap-4 py-12 text-white'
      }
    >
      <div className="h-10 w-10 rounded-full border-4 border-white/10 border-t-[#FF7A00] animate-spin" />

      {text && (
        <p className="text-sm text-zinc-400">
          {text}
        </p>
      )}
    </div>
  )
}