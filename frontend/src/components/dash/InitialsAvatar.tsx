// frontend/src/components/ui/InitialsAvatar.tsx
import React from "react";

interface InitialsAvatarProps {
  name: string;
  size?: number; // optional size in pixels
}

const InitialsAvatar: React.FC<InitialsAvatarProps> = ({ name, size = 32 }) => {
  // split the name into words
  const words = name.trim().split(" ").filter(Boolean);

  let initials = "";

  if (words.length === 1) {
    initials = words[0][0].toUpperCase();
  } else if (words.length === 2) {
    initials = words[0][0].toUpperCase() + words[1][0].toUpperCase();
  } else if (words.length >= 3) {
    initials =
      words[0][0].toUpperCase() + words[words.length - 1][0].toUpperCase();
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-sky-100 text-sky-600 font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {initials}
    </div>
  );
};

export default InitialsAvatar;
