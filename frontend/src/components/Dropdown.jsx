import React from "react";

export const Dropdown = ({
  button,
  children,
  isOpen,
  setIsOpen,
  menuId,
  align = "left",
  className = "",
  menuClassName = "",
}) => {
  const ref = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target) && isOpen) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setIsOpen(false);
      if ((e.key === "Enter" || e.key === " ") && e.target === ref.current?.querySelector("button")) {
        e.preventDefault();
        setIsOpen((v) => !v);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((v) => !v)}
        className="focus:outline-none"
      >
        {button}
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          className={`absolute ${align === "right" ? "right-0" : "left-0"} top-10 min-w-48 bg-white border border-gray-100 rounded-md shadow-lg ${menuClassName}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};
