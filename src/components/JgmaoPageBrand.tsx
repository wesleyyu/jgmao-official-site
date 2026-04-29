import logoImage from "@/assets/jgmao-logo-black-square.png";

export default function JgmaoPageBrand() {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-xl">
      <img src={logoImage} alt="坚果猫 JGMAO" className="h-9 w-9 rounded-2xl border border-white/10 object-cover" />
      <span className="text-sm font-medium text-white">坚果猫 JGMAO</span>
    </div>
  );
}
