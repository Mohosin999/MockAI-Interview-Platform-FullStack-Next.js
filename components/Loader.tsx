import Image from "next/image";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#010624]/30 backdrop-blur-md z-50">
      <div className="relative flex items-center justify-center">
        {/* Logo */}
        <Image
          src="/logo.png"
          alt="App Logo"
          width={120}
          height={120}
          className="rounded-full object-contain"
          priority
        />
        {/* Ping animation */}
        <span className="absolute inline-flex h-32 w-32 rounded-full bg-blue-500 opacity-75 animate-ping"></span>
      </div>
    </div>
  );
};

export default Loader;
