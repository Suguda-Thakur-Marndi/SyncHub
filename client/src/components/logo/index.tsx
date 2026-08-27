import { Layers } from "lucide-react";
import { Link } from "react-router-dom";

type LogoProps = {
  url?: string;
  asLink?: boolean;
};

const Logo = ({ url = "/", asLink = true }: LogoProps) => {
  const icon = (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 transition-transform duration-200 hover:scale-105">
      <Layers className="size-5" />
    </div>
  );

  if (!asLink) {
    return <div className="flex items-center justify-center sm:justify-start">{icon}</div>;
  }

  return (
    <div className="flex items-center justify-center sm:justify-start">
      <Link to={url}>{icon}</Link>
    </div>
  );
};

export default Logo;
