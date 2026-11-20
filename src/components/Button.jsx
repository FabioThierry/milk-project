const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...props
}) => {
  const variants = {
    primary: 'bg-blue-600 text-white shadow-blue-600/20 hover:bg-blue-700',
    success: 'bg-emerald-600 text-white shadow-emerald-600/20 hover:bg-emerald-700',
    danger: 'bg-red-600 text-white shadow-red-600/20 hover:bg-red-700',
    ghost: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50',
  };

  const sizes = {
    sm: 'min-h-10 px-3 py-2 text-sm',
    md: 'min-h-11 px-4 py-3 text-base',
    lg: 'min-h-12 px-6 py-4 text-lg',
    icon: 'h-10 w-10 min-h-10 p-0',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-xl font-bold shadow-sm transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
