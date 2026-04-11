"use client";

export default function LandingSmoothLink({ targetId, children, className }) {
  const handleClick = (e) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
